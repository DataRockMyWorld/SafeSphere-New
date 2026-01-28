from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from .serializers import LoginSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer, LogoutUserSerializer, UserMeSerializer, UserSerializer, EmailVerificationSerializer, ResendVerificationEmailSerializer, NotificationSerializer
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.permissions import AllowAny, IsAuthenticated
from urllib.parse import unquote
import logging
from .models import User, Notification
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework import generics
from .services import send_password_reset_email, send_password_change_notification
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from datetime import timedelta
import traceback
import os
from core.mask_email import mask_email

User = get_user_model()
logger = logging.getLogger(__name__)

class PasswordResetThrottle(AnonRateThrottle):
    rate = '3/hour'

class LoginThrottle(AnonRateThrottle):
    rate = '5/minute'

class LoginUserView(generics.CreateAPIView):
    """View for user login."""
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable JWT auth on login to avoid invalid token errors

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except AuthenticationFailed as e:
            logger.warning(f"Authentication failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            tb = traceback.format_exc()
            logger.error(f"Login error: {str(e)}\nTraceback:\n{tb}")
            # Return traceback in response if DEBUG is True
            if getattr(settings, 'DEBUG', False):
                return Response(
                    {"error": "An error occurred during login. Please try again.", "traceback": tb},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            else:
                return Response(
                    {"error": "An error occurred during login. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

class LogoutUserView(generics.GenericAPIView):
    """View for user logout."""
    serializer_class = LogoutUserSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = self.serializer_class(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response(
                {"error": "An error occurred during logout. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserMeView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating the current user's information."""
    serializer_class = UserMeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class PasswordResetRequestView(generics.GenericAPIView):
    """View for requesting a password reset."""
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        """
        Generate and send a password reset code to the user's email.
        Always returns success to prevent email enumeration attacks.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email, is_active=True)
            
            # Generate reset code
            reset_code = user.generate_reset_code()
            logger.info(f"Password reset code generated for {mask_email(email)}")
            
            # Build reset URL
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            reset_url = f"{frontend_url}/reset-password/{user.pk}/{reset_code}/"
            
            # Send password reset email
            from .services import send_password_reset_email
            send_password_reset_email(user, reset_url)
            
            logger.info(f"Password reset email sent to {mask_email(email)}")
            
        except User.DoesNotExist:
            # Don't reveal that user doesn't exist (security best practice)
            logger.warning(f"Password reset requested for non-existent email: {mask_email(email)}")
        except Exception as e:
            logger.error(f"Error processing password reset request for {mask_email(email)}: {str(e)}")
            # Still return success to prevent email enumeration
        
        # Always return the same success message regardless of whether user exists
        return Response(
            {
                "message": "If an account with that email exists, a password reset code has been sent."
            },
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """View for confirming password reset."""
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request, user_id, reset_code):
        try:
            user = User.objects.get(pk=user_id)
            
            if not user.verify_reset_code(reset_code):
                return Response(
                    {"error": "Invalid or expired reset code."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Set the new password
            user.set_password(serializer.validated_data['password'])
            user.save()
            
            # Clear the reset code after successful password reset
            user.clear_reset_code()
            
            # Send password change notification
            send_password_change_notification(user)
            
            return Response(
                {"message": "Password has been reset successfully."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return Response(
                {"error": "An error occurred during password reset. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EmailVerificationView(generics.GenericAPIView):
    serializer_class = EmailVerificationSerializer
    permission_classes = [AllowAny]

    def get(self, request, user_id, token):
        try:
            user = User.objects.get(pk=user_id)
            
            # Check if email is already verified
            if user.email_verified:
                return Response(
                    {
                        "message": "Email is already verified. You can now log in.",
                        "email": user.email,
                        "verified": True
                    },
                    status=status.HTTP_200_OK
                )
            
            # Verify the email
            if user.verify_email(token):
                # If verification successful, send welcome email
                subject = "Welcome to SafeSphere"
                message = (
                    f"Hello {user.first_name},\n\n"
                    f"Thank you for verifying your email. Your account is now active.\n\n"
                    f"You can now log in to your account.\n\n"
                    f"Thank you for choosing SafeSphere."
                )
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                
                return Response(
                    {
                        "message": "Email verified successfully. You can now log in.",
                        "email": user.email,
                        "verified": True
                    },
                    status=status.HTTP_200_OK
                )
            
            return Response(
                {
                    "message": "Invalid or expired verification token. Please request a new verification email.",
                    "email": user.email,
                    "verified": False
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except User.DoesNotExist:
            return Response(
                {"message": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class ResendVerificationEmailView(generics.GenericAPIView):
    serializer_class = ResendVerificationEmailSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            
            if user.email_verified:
                return Response(
                    {
                        "message": "Email is already verified. You can now log in.",
                        "email": user.email,
                        "verified": True
                    },
                    status=status.HTTP_200_OK
                )
            
            # Generate new verification token
            token = user.generate_email_verification_token()
            verification_url = f"http://127.0.0.1:8000/api/v1/verify-email/{user.pk}/{token}/"
            
            # Send verification email
            subject = "Verify Your Email"
            message = (
                f"Hello {user.first_name},\n\n"
                f"Please verify your email by clicking the link below:\n\n"
                f"{verification_url}\n\n"
                f"Thank you."
            )
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response(
                {
                    "message": "Verification email sent successfully. Please check your inbox.",
                    "email": user.email,
                    "verified": False
                },
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {"message": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

def send_password_change_notification(user):
    subject = "Password Changed"
    message = (
        f"Hello {user.first_name},\n\n"
        f"Your password has been successfully changed. If you did not initiate this change, please contact support immediately.\n\n"
        f"Thank you."
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class CreateUserView(generics.CreateAPIView):
    """View for creating new users (admin only)."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # You might want to add a custom permission for admin only

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Create the user (this will automatically send password reset email)
            user = serializer.save()
            
            return Response({
                "message": f"User {user.email} created successfully. Password reset email has been sent.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "department": user.department,
                    "position": user.position
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"User creation error: {str(e)}")
            return Response(
                {"error": "An error occurred while creating the user. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CreateTestUserView(generics.CreateAPIView):
    """Development-only view for creating test users with known passwords."""
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Only for development

    def create(self, request, *args, **kwargs):
        # Only allow in development
        if os.getenv('DJANGO_ENV', 'development') != 'development':
            return Response(
                {"error": "This endpoint is only available in development mode."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            email = request.data.get('email', 'test@example.com')
            password = request.data.get('password', 'testpass123')
            first_name = request.data.get('first_name', 'Test')
            last_name = request.data.get('last_name', 'User')
            phone_number = request.data.get('phone_number', '1234567890')
            role = request.data.get('role', 'EMPLOYEE')
            position = request.data.get('position', 'TECHNICIAN')
            department = request.data.get('department', 'OPERATIONS')
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                user.set_password(password)
                user.save()
                message = f"Updated existing user {email} with new password"
            else:
                # Create new user with known password
                user = User.objects.create_user(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    phone_number=phone_number,
                    role=role,
                    position=position,
                    department=department,
                    password=password,  # This will work in development mode
                    is_active=True,
                    is_staff=False,
                    is_superuser=False
                )
                message = f"Created test user {email} with password: {password}"
            
            return Response({
                "message": message,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "department": user.department,
                    "position": user.position,
                    "password": password
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Test user creation error: {str(e)}")
            return Response(
                {"error": f"An error occurred while creating the test user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# =============================
# Notification Views
# =============================

class NotificationListView(generics.ListAPIView):
    """View for listing user notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        unread_count = queryset.filter(is_read=False).count()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'notifications': serializer.data,
            'unread_count': unread_count
        })


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        notification = self.get_object()
        # Mark as read when retrieved
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.delete()
        return Response({'message': 'Notification deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class MarkAllNotificationsReadView(generics.GenericAPIView):
    """View for marking all notifications as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True, 
            read_at=timezone.now()
        )
        return Response({'message': 'All notifications marked as read'})


class DeleteAllNotificationsView(generics.GenericAPIView):
    """View for deleting all notifications."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user).delete()
        return Response({'message': 'All notifications deleted'})


class CreateWelcomeNotificationView(generics.GenericAPIView):
    """View for creating welcome notification (for testing)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only create welcome notification if user hasn't received one before
        if request.user.should_receive_welcome_notification():
            notification = Notification.create_welcome_notification(request.user)
            serializer = NotificationSerializer(notification)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'message': 'Welcome notification already exists for this user'}, 
                status=status.HTTP_200_OK
            )


class FirstTimeLoginNotificationView(generics.GenericAPIView):
    """View for creating welcome notification on first-time login."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only create welcome notification if user hasn't received one before
        if request.user.should_receive_welcome_notification():
            notification = Notification.create_welcome_notification(request.user)
            serializer = NotificationSerializer(notification)
            return Response({
                'notification': serializer.data,
                'is_first_time': True
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Welcome notification already exists for this user',
                'is_first_time': False
            }, status=status.HTTP_200_OK)