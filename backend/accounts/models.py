from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _
from .managers import UserManager
from django.utils import timezone
from datetime import timedelta
from django.utils.crypto import get_random_string
import random
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model for SafeSphere."""
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Manager'),
        ('EMPLOYEE', 'Employee'),
    )
    
    POSITION_CHOICES = (
        ('MD', 'MD'),
        ('OPS MANAGER', 'Ops Manager'),
        ('FINANCE MANAGER', 'Finance Manager'),
        ('HSSE MANAGER', 'HSSE Manager'),
        ('TECHNICIAN', 'Technician'),
    )
    
    DEPARTMENT_CHOICES = (
        ('OPERATIONS', 'Operations'),
        ('MARKETING', 'Marketing'),
        ('HSSE', 'HSSE'),
        ('FINANCE', 'Finance'),
    )
    
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=30)
    last_name = models.CharField(_('last name'), max_length=30)
    phone_number = models.CharField(_('phone number'), max_length=15)
    role = models.CharField(_('role'), max_length=10, choices=ROLE_CHOICES, default='EMPLOYEE')
    position = models.CharField(_('position'), max_length=20, choices=POSITION_CHOICES, default='TECHNICIAN', null=True, blank=True)
    department = models.CharField(_('department'), max_length=20, choices=DEPARTMENT_CHOICES, default='OPERATIONS')
    is_active = models.BooleanField(_('active'), default=True)
    is_staff = models.BooleanField(_('staff status'), default=False)
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)
    last_login = models.DateTimeField(_('last login'), null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    reset_code = models.CharField(max_length=6, null=True, blank=True)
    reset_code_created_at = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone_number']

    def __str__(self):
        return self.email

    @property
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return self.first_name

    def generate_reset_code(self):
        """Generate a 6-digit reset code."""
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        self.reset_code = code
        self.reset_code_created_at = timezone.now()
        self.save()
        return code

    def verify_reset_code(self, code):
        """Verify if the reset code is valid and not expired."""
        if not self.reset_code or not self.reset_code_created_at:
            return False
        
        # Check if code matches and is not expired (15 minutes validity)
        is_valid = (
            self.reset_code == code and
            timezone.now() - self.reset_code_created_at < timedelta(minutes=15)
        )
        
        return is_valid

    def clear_reset_code(self):
        """Clear the reset code after successful password reset."""
        self.reset_code = None
        self.reset_code_created_at = None
        self.save()

    def record_failed_login(self):
        """Record a failed login attempt and handle account locking."""
        self.failed_login_attempts += 1
        self.last_failed_login = timezone.now()
        
        # Check if account should be locked
        if self.failed_login_attempts >= settings.ACCOUNT_LOCKOUT_ATTEMPTS:
            self.account_locked_until = timezone.now() + timedelta(minutes=settings.ACCOUNT_LOCKOUT_DURATION)
            logger.warning(f"Account locked for {self.email} until {self.account_locked_until}")
        
        self.save()

    def reset_failed_login_attempts(self):
        """Reset failed login attempts after successful login."""
        self.failed_login_attempts = 0
        self.last_failed_login = None
        self.account_locked_until = None
        self.save()

    def is_account_locked(self):
        """Check if the account is currently locked."""
        if not self.account_locked_until:
            return False
        
        if timezone.now() > self.account_locked_until:
            # If lock period has expired, reset the lock
            self.account_locked_until = None
            self.failed_login_attempts = 0
            self.save()
            return False
        
        return True

class Notification(models.Model):
    """Notification model for user notifications."""
    NOTIFICATION_TYPES = (
        ('WELCOME', 'Welcome'),
        ('CHANGE_REQUEST', 'Change Request'),
        ('DOCUMENT_APPROVED', 'Document Approved'),
        ('DOCUMENT_REJECTED', 'Document Rejected'),
        ('RECORD_SUBMITTED', 'Record Submitted'),
        ('RECORD_APPROVED', 'Record Approved'),
        ('RECORD_REJECTED', 'Record Rejected'),
        ('SYSTEM', 'System'),
    )
    
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    related_object_id = models.CharField(max_length=50, null=True, blank=True)
    related_object_type = models.CharField(max_length=50, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} - {self.user.email} - {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
    
    @classmethod
    def create_welcome_notification(cls, user):
        """Create a welcome notification for new users."""
        return cls.objects.create(
            user=user,
            notification_type='WELCOME',
            title='Welcome to SafeSphere!',
            message=f"""Welcome to SafeSphere, {user.first_name}!

Here's what you can expect:

📋 **Document Management**: Access and manage company documents
📝 **Forms & Records**: Submit forms and track their approval status
🔄 **Change Requests**: Request changes to existing documents
✅ **Approval Workflows**: Review and approve documents based on your role

Your role: {user.get_role_display()}
Department: {user.get_department_display()}

If you have any questions, please contact your system administrator.

Enjoy using SafeSphere!"""
        )
    
    @classmethod
    def create_change_request_notification(cls, change_request):
        """Create notification for HSSE Managers when a change request is submitted."""
        # Find all HSSE Managers
        from django.contrib.auth import get_user_model
        User = get_user_model()
        hsse_managers = User.objects.filter(position='HSSE MANAGER', is_active=True)
        
        notifications = []
        for manager in hsse_managers:
            notification = cls.objects.create(
                user=manager,
                notification_type='CHANGE_REQUEST',
                title='New Change Request Submitted',
                message=f"""A new change request has been submitted for the document "{change_request.document.title}".

**Requested by**: {change_request.requested_by.get_full_name if change_request.requested_by else 'Unknown'}
**Reason**: {change_request.reason}

Please review and take action on this change request."""
            )
            notifications.append(notification)
        
        return notifications
    