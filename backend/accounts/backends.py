"""
Custom authentication backend for email-based authentication.
"""
import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()
logger = logging.getLogger(__name__)


class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to authenticate using email instead of username.
    """
    
    def authenticate(self, request, email=None, password=None, **kwargs):
        """
        Authenticate a user using email and password.
        
        Args:
            request: The HTTP request object
            email: User's email address
            password: User's password
            **kwargs: Additional keyword arguments
        
        Returns:
            User object if authentication succeeds, None otherwise
        """
        logger.debug(f"EmailBackend.authenticate called with email={email}")
        
        if email is None or password is None:
            logger.debug("EmailBackend: email or password is None")
            return None
        
        try:
            user = User.objects.get(email=email)
            logger.debug(f"EmailBackend: User found - {user.email}, is_active={user.is_active}")
        except User.DoesNotExist:
            logger.debug(f"EmailBackend: User with email {email} does not exist")
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a non-existing user
            User().set_password(password)
            return None
        
        # Check if account is locked
        if user.is_account_locked():
            logger.debug(f"EmailBackend: Account is locked for {email}")
            return None
        
        # Check if account is active
        if not user.is_active:
            logger.debug(f"EmailBackend: Account is inactive for {email}")
            return None
        
        # Verify password
        password_valid = user.check_password(password)
        logger.debug(f"EmailBackend: Password check result for {email}: {password_valid}")
        
        if password_valid:
            logger.info(f"EmailBackend: Authentication successful for {email}")
            return user
        
        logger.debug(f"EmailBackend: Password invalid for {email}")
        return None
    
    def get_user(self, user_id):
        """
        Retrieve a user by their user ID.
        
        Args:
            user_id: The user's ID
        
        Returns:
            User object if found, None otherwise
        """
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        
        return user if user.is_active else None

