from django.urls import path, include
from .views import (
    LoginUserView, LogoutUserView, UserMeView, PasswordResetConfirmView,
    EmailVerificationView, ResendVerificationEmailView, UserListCreateAPIView,
    UserDetailAPIView, CreateUserView, NotificationListView, NotificationDetailView,
    MarkAllNotificationsReadView, DeleteAllNotificationsView, CreateWelcomeNotificationView
)

urlpatterns = [
    # Authentication endpoints
    
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('me/', UserMeView.as_view(), name='me'),
    path('password-reset/<int:user_id>/<str:reset_code>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('verify-email/<int:user_id>/<str:token>/', EmailVerificationView.as_view(), name='email-verification'),
    path('resend-verification/', ResendVerificationEmailView.as_view(), name='resend-verification'),
    
    # User management endpoints
    
    path('users/', UserListCreateAPIView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('create-user/', CreateUserView.as_view(), name='create-user'),
    
    # Notification URLs
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark-all-notifications-read'),
    path('notifications/delete-all/', DeleteAllNotificationsView.as_view(), name='delete-all-notifications'),
    path('notifications/create-welcome/', CreateWelcomeNotificationView.as_view(), name='create-welcome-notification'),
]