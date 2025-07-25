from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _
from django.utils.http import urlsafe_base64_encode
from urllib.parse import quote
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
import logging
import os

logger = logging.getLogger(__name__)

class UserManager(BaseUserManager):
    
    def email_validator(self, email):
        """Validate the email address."""
        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError(_('The Email field must be a valid email address'))

    def create_user(self, email, first_name, last_name, phone_number, password=None, **extra_fields):
        """Create and save a regular user with the given email, name, phone number, and password."""
        if not email:
            raise ValueError(_('The Email field must be set'))
        else:
            email = self.normalize_email(email)
            self.email_validator(email)
        if not first_name:
            raise ValueError(_('The First Name field must be set'))
        if not last_name:
            raise ValueError(_('The Last Name field must be set'))
        if not phone_number:
            raise ValueError(_('The Phone Number field must be set'))
        
        # CHECK IF THE USER ALREADY EXISTS
        if self.model.objects.filter(email=email).exists():
            raise ValidationError(_('User with this email already exists.'))
        
        # Set is_active to True for non-admin users
        if not extra_fields.get('is_superuser', False):
            extra_fields['is_active'] = True
        
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            **extra_fields
        )

        # Check if we're in development mode and password is provided
        is_development = os.getenv('DJANGO_ENV', 'development') == 'development'
        
        if not extra_fields.get('is_superuser', False):
            if is_development and password:
                # In development, use the provided password
                user.set_password(password)
                user.save(using=self._db)
                logger.info(f"Created user {email} with provided password in development mode")
            else:
                # Generate a random password for the user if it's not a superuser creation
                password = get_random_string(length=12)
                user.set_password(password)
                user.save(using=self._db)
                
                # Send password reset email
                logger.info(f"Sending password reset email to {email}")
                self.send_verification_email(user)
                logger.info(f"Password reset email sent to {email}")
        else:
            # This block is for creating superusers
            raise ValueError(_('Regular users cannot have password set by superusers'))
        
        return user

    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        """Create and save a superuser with the given email, name, phone number, and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if not password:
            raise ValueError(_('Superusers must have a password.'))

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        user = self.model (
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def send_verification_email(self, user):
        """Send a verification email to the user with a password reset link."""
        try:
            reset_code = user.generate_reset_code()
            logger.info(f"Generated reset code for user {user.email}")
            
            # Use settings to get the frontend URL, with fallback to localhost
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            reset_url = f"{frontend_url}/reset-password/{user.pk}/{reset_code}/"
            logger.info(f"Generated reset URL: {reset_url}")

            # Use the new notification service to send both email and SMS
            from .services import send_password_reset_notification
            send_password_reset_notification(user, reset_url)
            logger.info(f"Password reset notifications sent successfully to {user.email}")
            
        except Exception as e:
            logger.error(f"Failed to send verification notifications to {user.email}: {str(e)}")
            raise