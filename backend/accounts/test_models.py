"""
Comprehensive tests for accounts models.
Tests cover User model functionality, security features, and edge cases.
"""
import pytest
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.conf import settings
from datetime import timedelta
from accounts.models import Notification
from freezegun import freeze_time

User = get_user_model()


class UserModelTests(TestCase):
    """Tests for User model basic functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.user_data = {
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '1234567890',
            'password': 'testpass123'
        }
    
    def test_create_user_success(self):
        """Test creating a user with valid data succeeds."""
        user = User.objects.create_user(**self.user_data)
        
        assert user.email == self.user_data['email']
        assert user.first_name == self.user_data['first_name']
        assert user.last_name == self.user_data['last_name']
        assert user.check_password(self.user_data['password'])
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False
    
    def test_create_user_without_email_fails(self):
        """Test creating a user without email raises error."""
        user_data = self.user_data.copy()
        del user_data['email']
        
        with pytest.raises(ValueError):
            User.objects.create_user(**user_data)
    
    def test_create_user_with_duplicate_email_fails(self):
        """Test creating a user with duplicate email fails."""
        User.objects.create_user(**self.user_data)
        
        with pytest.raises(Exception):  # IntegrityError
            User.objects.create_user(**self.user_data)
    
    def test_user_str_returns_email(self):
        """Test string representation of user."""
        user = User.objects.create_user(**self.user_data)
        assert str(user) == user.email
    
    def test_get_full_name(self):
        """Test get_full_name property."""
        user = User.objects.create_user(**self.user_data)
        expected = f"{self.user_data['first_name']} {self.user_data['last_name']}"
        assert user.get_full_name == expected
    
    def test_get_short_name(self):
        """Test get_short_name method."""
        user = User.objects.create_user(**self.user_data)
        assert user.get_short_name() == self.user_data['first_name']
    
    def test_create_superuser(self):
        """Test creating a superuser."""
        user = User.objects.create_superuser(
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            phone_number='1234567890',
            password='adminpass123'
        )
        
        assert user.is_staff is True
        assert user.is_superuser is True
        assert user.is_active is True


class UserPasswordResetTests(TestCase):
    """Tests for password reset functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
    
    def test_generate_reset_code_creates_6_digit_code(self):
        """Test reset code generation creates 6-digit code."""
        code = self.user.generate_reset_code()
        
        assert len(code) == 6
        assert code.isdigit()
        assert self.user.reset_code == code
        assert self.user.reset_code_created_at is not None
    
    def test_generate_reset_code_overwrites_previous_code(self):
        """Test generating a new code overwrites the old one."""
        first_code = self.user.generate_reset_code()
        second_code = self.user.generate_reset_code()
        
        assert first_code != second_code
        assert self.user.reset_code == second_code
    
    def test_verify_reset_code_with_valid_code_succeeds(self):
        """Test verifying a valid reset code succeeds."""
        code = self.user.generate_reset_code()
        
        assert self.user.verify_reset_code(code) is True
    
    def test_verify_reset_code_with_invalid_code_fails(self):
        """Test verifying an invalid code fails."""
        self.user.generate_reset_code()
        
        assert self.user.verify_reset_code('000000') is False
    
    @freeze_time("2025-01-01 12:00:00")
    def test_verify_reset_code_with_expired_code_fails(self):
        """Test verifying an expired code fails."""
        code = self.user.generate_reset_code()
        
        # Move time forward 16 minutes (past 15 minute expiry)
        with freeze_time("2025-01-01 12:16:00"):
            assert self.user.verify_reset_code(code) is False
    
    @freeze_time("2025-01-01 12:00:00")
    def test_verify_reset_code_within_expiry_window_succeeds(self):
        """Test verifying a code within 15 minutes succeeds."""
        code = self.user.generate_reset_code()
        
        # Move time forward 14 minutes (within expiry)
        with freeze_time("2025-01-01 12:14:00"):
            assert self.user.verify_reset_code(code) is True
    
    def test_verify_reset_code_without_code_fails(self):
        """Test verifying when no code exists fails."""
        assert self.user.verify_reset_code('123456') is False
    
    def test_clear_reset_code_removes_code_and_timestamp(self):
        """Test clearing reset code removes both code and timestamp."""
        self.user.generate_reset_code()
        self.user.clear_reset_code()
        
        self.user.refresh_from_db()
        assert self.user.reset_code is None
        assert self.user.reset_code_created_at is None


class UserAccountLockoutTests(TestCase):
    """Tests for account lockout mechanism."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        # Mock settings
        if not hasattr(settings, 'ACCOUNT_LOCKOUT_ATTEMPTS'):
            settings.ACCOUNT_LOCKOUT_ATTEMPTS = 3
        if not hasattr(settings, 'ACCOUNT_LOCKOUT_DURATION'):
            settings.ACCOUNT_LOCKOUT_DURATION = 30  # 30 minutes
    
    def test_record_failed_login_increments_counter(self):
        """Test recording a failed login increments the counter."""
        initial_attempts = self.user.failed_login_attempts
        self.user.record_failed_login()
        
        self.user.refresh_from_db()
        assert self.user.failed_login_attempts == initial_attempts + 1
        assert self.user.last_failed_login is not None
    
    def test_account_locks_after_max_attempts(self):
        """Test account locks after maximum failed attempts."""
        for _ in range(settings.ACCOUNT_LOCKOUT_ATTEMPTS):
            self.user.record_failed_login()
        
        self.user.refresh_from_db()
        assert self.user.is_account_locked() is True
        assert self.user.account_locked_until is not None
    
    def test_is_account_locked_returns_false_when_not_locked(self):
        """Test is_account_locked returns False when not locked."""
        assert self.user.is_account_locked() is False
    
    @freeze_time("2025-01-01 12:00:00")
    def test_is_account_locked_returns_false_after_lockout_expires(self):
        """Test account unlocks after lockout period expires."""
        # Lock the account
        for _ in range(settings.ACCOUNT_LOCKOUT_ATTEMPTS):
            self.user.record_failed_login()
        
        assert self.user.is_account_locked() is True
        
        # Move time forward past lockout duration
        with freeze_time("2025-01-01 12:35:00"):  # 35 minutes later
            assert self.user.is_account_locked() is False
            
            # Verify fields are reset
            self.user.refresh_from_db()
            assert self.user.account_locked_until is None
            assert self.user.failed_login_attempts == 0
    
    def test_reset_failed_login_attempts_clears_all_fields(self):
        """Test reset clears all failed login fields."""
        # Create failed attempts
        for _ in range(2):
            self.user.record_failed_login()
        
        self.user.reset_failed_login_attempts()
        self.user.refresh_from_db()
        
        assert self.user.failed_login_attempts == 0
        assert self.user.last_failed_login is None
        assert self.user.account_locked_until is None
    
    def test_multiple_failed_logins_under_threshold_dont_lock(self):
        """Test account doesn't lock with attempts under threshold."""
        for _ in range(settings.ACCOUNT_LOCKOUT_ATTEMPTS - 1):
            self.user.record_failed_login()
        
        self.user.refresh_from_db()
        assert self.user.is_account_locked() is False


class UserPositionAndRoleTests(TestCase):
    """Tests for user roles and positions."""
    
    def test_create_user_with_different_roles(self):
        """Test creating users with different roles."""
        roles = ['ADMIN', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE']
        
        for role in roles:
            user = User.objects.create_user(
                email=f'{role.lower()}@example.com',
                first_name=role,
                last_name='User',
                phone_number='1234567890',
                password='testpass123',
                role=role
            )
            assert user.role == role
    
    def test_create_user_with_different_positions(self):
        """Test creating users with different positions."""
        positions = ['MD', 'OPS MANAGER', 'FINANCE MANAGER', 'HSSE MANAGER', 
                     'TECHNICIAN', 'GENERAL STAFF']
        
        for position in positions:
            user = User.objects.create_user(
                email=f'{position.replace(" ", "_").lower()}@example.com',
                first_name='Test',
                last_name='User',
                phone_number='1234567890',
                password='testpass123',
                position=position
            )
            assert user.position == position
    
    def test_default_role_is_employee(self):
        """Test default role is EMPLOYEE."""
        user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        assert user.role == 'EMPLOYEE'
    
    def test_default_department_is_operations(self):
        """Test default department is OPERATIONS."""
        user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        assert user.department == 'OPERATIONS'


class NotificationModelTests(TestCase):
    """Tests for Notification model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
    
    def test_create_notification(self):
        """Test creating a notification."""
        notification = Notification.objects.create(
            user=self.user,
            notification_type='SYSTEM',
            title='Test Notification',
            message='This is a test message'
        )
        
        assert notification.user == self.user
        assert notification.is_read is False
        assert notification.read_at is None
    
    def test_mark_as_read_updates_status(self):
        """Test marking notification as read."""
        notification = Notification.objects.create(
            user=self.user,
            notification_type='SYSTEM',
            title='Test',
            message='Test'
        )
        
        notification.mark_as_read()
        
        assert notification.is_read is True
        assert notification.read_at is not None
    
    def test_mark_as_read_is_idempotent(self):
        """Test marking as read multiple times doesn't change read_at."""
        notification = Notification.objects.create(
            user=self.user,
            notification_type='SYSTEM',
            title='Test',
            message='Test'
        )
        
        notification.mark_as_read()
        first_read_at = notification.read_at
        
        notification.mark_as_read()
        
        assert notification.read_at == first_read_at
    
    def test_create_welcome_notification(self):
        """Test creating a welcome notification."""
        notification = Notification.create_welcome_notification(self.user)
        
        assert notification.user == self.user
        assert notification.notification_type == 'WELCOME'
        assert 'Welcome to SafeSphere' in notification.title
        assert self.user.first_name in notification.message
    
    def test_should_receive_welcome_notification_for_new_user(self):
        """Test new user should receive welcome notification."""
        assert self.user.should_receive_welcome_notification() is True
    
    def test_should_not_receive_welcome_notification_twice(self):
        """Test user shouldn't receive welcome notification twice."""
        Notification.create_welcome_notification(self.user)
        assert self.user.should_receive_welcome_notification() is False
    
    def test_notification_ordering(self):
        """Test notifications are ordered by creation date (newest first)."""
        notification1 = Notification.objects.create(
            user=self.user,
            notification_type='SYSTEM',
            title='First',
            message='First'
        )
        notification2 = Notification.objects.create(
            user=self.user,
            notification_type='SYSTEM',
            title='Second',
            message='Second'
        )
        
        notifications = Notification.objects.all()
        assert notifications[0] == notification2
        assert notifications[1] == notification1


class UserEdgeCasesTests(TestCase):
    """Tests for edge cases and boundary conditions."""
    
    def test_email_case_insensitivity(self):
        """Test email addresses are handled case-insensitively."""
        User.objects.create_user(
            email='Test@Example.COM',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        
        # This should fail due to unique constraint
        with pytest.raises(Exception):
            User.objects.create_user(
                email='test@example.com',
                first_name='Test2',
                last_name='User2',
                phone_number='0987654321',
                password='testpass123'
            )
    
    def test_very_long_names(self):
        """Test handling of maximum length names."""
        long_name = 'A' * 30  # max_length=30
        user = User.objects.create_user(
            email='test@example.com',
            first_name=long_name,
            last_name=long_name,
            phone_number='1234567890',
            password='testpass123'
        )
        
        assert user.first_name == long_name
        assert user.last_name == long_name
    
    def test_special_characters_in_names(self):
        """Test handling of special characters in names."""
        user = User.objects.create_user(
            email='test@example.com',
            first_name="O'Brien",
            last_name='São-Paulo',
            phone_number='1234567890',
            password='testpass123'
        )
        
        assert user.first_name == "O'Brien"
        assert user.last_name == 'São-Paulo'
    
    def test_empty_phone_number_fails(self):
        """Test creating user with empty phone number fails."""
        with pytest.raises(Exception):
            User.objects.create_user(
                email='test@example.com',
                first_name='Test',
                last_name='User',
                phone_number='',
                password='testpass123'
            )
    
    def test_unicode_in_user_fields(self):
        """Test handling of Unicode characters."""
        user = User.objects.create_user(
            email='test@example.com',
            first_name='测试',
            last_name='ユーザー',
            phone_number='1234567890',
            password='testpass123'
        )
        
        assert user.first_name == '测试'
        assert user.last_name == 'ユーザー'

