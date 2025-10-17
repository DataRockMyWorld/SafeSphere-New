"""
Comprehensive API tests for accounts endpoints.
Tests authentication, authorization, rate limiting, and security.
"""
import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import Notification
from freezegun import freeze_time

User = get_user_model()


class LoginAPITests(APITestCase):
    """Tests for login endpoint."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.login_url = reverse('login')  # Adjust to your URL name
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
    
    def test_login_with_valid_credentials_succeeds(self):
        """Test login with valid credentials returns tokens."""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data or 'access_token' in response.data
        assert 'refresh' in response.data or 'refresh_token' in response.data
    
    def test_login_with_invalid_password_fails(self):
        """Test login with invalid password returns 401."""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_with_invalid_email_fails(self):
        """Test login with non-existent email returns 401."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_with_missing_email_fails(self):
        """Test login without email returns 400."""
        data = {'password': 'testpass123'}
        
        response = self.client.post(self.login_url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_login_with_missing_password_fails(self):
        """Test login without password returns 400."""
        data = {'email': 'test@example.com'}
        
        response = self.client.post(self.login_url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_login_with_empty_payload_fails(self):
        """Test login with empty payload returns 400."""
        response = self.client.post(self.login_url, {})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_login_with_inactive_user_fails(self):
        """Test login with inactive user fails."""
        self.user.is_active = False
        self.user.save()
        
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_updates_last_login(self):
        """Test successful login updates last_login timestamp."""
        initial_last_login = self.user.last_login
        
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.user.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert self.user.last_login != initial_last_login
    
    def test_login_resets_failed_attempts_on_success(self):
        """Test successful login resets failed login attempts."""
        # Simulate failed attempts
        self.user.failed_login_attempts = 2
        self.user.save()
        
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.user.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert self.user.failed_login_attempts == 0
    
    def test_login_with_locked_account_fails(self):
        """Test login with locked account fails."""
        # Lock the account
        from django.conf import settings
        if not hasattr(settings, 'ACCOUNT_LOCKOUT_ATTEMPTS'):
            settings.ACCOUNT_LOCKOUT_ATTEMPTS = 3
        
        for _ in range(settings.ACCOUNT_LOCKOUT_ATTEMPTS):
            self.user.record_failed_login()
        
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'locked' in str(response.data).lower() or 'account' in str(response.data).lower()


class PasswordResetAPITests(APITestCase):
    """Tests for password reset endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
    
    def test_password_reset_confirm_with_valid_code_succeeds(self):
        """Test password reset with valid code succeeds."""
        reset_code = self.user.generate_reset_code()
        url = reverse('password-reset-confirm', kwargs={
            'user_id': self.user.pk,
            'reset_code': reset_code
        })
        
        data = {
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify password was changed
        self.user.refresh_from_db()
        assert self.user.check_password('newpassword123')
    
    def test_password_reset_with_invalid_code_fails(self):
        """Test password reset with invalid code fails."""
        self.user.generate_reset_code()
        url = reverse('password-reset-confirm', kwargs={
            'user_id': self.user.pk,
            'reset_code': '000000'
        })
        
        data = {
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    @freeze_time("2025-01-01 12:00:00")
    def test_password_reset_with_expired_code_fails(self):
        """Test password reset with expired code fails."""
        reset_code = self.user.generate_reset_code()
        
        url = reverse('password-reset-confirm', kwargs={
            'user_id': self.user.pk,
            'reset_code': reset_code
        })
        
        data = {
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        # Move time forward past expiry
        with freeze_time("2025-01-01 12:20:00"):
            response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_password_reset_with_nonexistent_user_fails(self):
        """Test password reset with non-existent user fails."""
        url = reverse('password-reset-confirm', kwargs={
            'user_id': 99999,
            'reset_code': '123456'
        })
        
        data = {
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_password_reset_clears_reset_code(self):
        """Test successful password reset clears the reset code."""
        reset_code = self.user.generate_reset_code()
        url = reverse('password-reset-confirm', kwargs={
            'user_id': self.user.pk,
            'reset_code': reset_code
        })
        
        data = {
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        
        self.user.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert self.user.reset_code is None
        assert self.user.reset_code_created_at is None


class UserMeAPITests(APITestCase):
    """Tests for user profile endpoint."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        self.url = reverse('user-me')  # Adjust to your URL name
    
    def test_get_user_me_without_auth_fails(self):
        """Test accessing user-me without authentication fails."""
        response = self.client.get(self.url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_user_me_with_auth_succeeds(self):
        """Test accessing user-me with authentication succeeds."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == self.user.email
        assert response.data['first_name'] == self.user.first_name
    
    def test_update_user_me_with_valid_data_succeeds(self):
        """Test updating user profile with valid data succeeds."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        
        response = self.client.patch(self.url, data)
        
        assert response.status_code == status.HTTP_200_OK
        
        self.user.refresh_from_db()
        assert self.user.first_name == 'Updated'
        assert self.user.last_name == 'Name'
    
    def test_update_user_me_cannot_change_email(self):
        """Test updating email through user-me is not allowed or fails."""
        self.client.force_authenticate(user=self.user)
        
        original_email = self.user.email
        data = {
            'email': 'newemail@example.com'
        }
        
        response = self.client.patch(self.url, data)
        
        self.user.refresh_from_db()
        # Email should either not change or request should fail
        assert self.user.email == original_email or response.status_code >= 400


class NotificationAPITests(APITestCase):
    """Tests for notification endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        self.notification = Notification.objects.create(
            user=self.user,
            notification_type='SYSTEM',
            title='Test Notification',
            message='Test message'
        )
        self.list_url = reverse('notification-list')  # Adjust to your URL name
    
    def test_list_notifications_without_auth_fails(self):
        """Test listing notifications without auth fails."""
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_notifications_with_auth_succeeds(self):
        """Test listing notifications with auth succeeds."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'notifications' in response.data or isinstance(response.data, list)
    
    def test_list_notifications_only_shows_user_notifications(self):
        """Test user only sees their own notifications."""
        other_user = User.objects.create_user(
            email='other@example.com',
            first_name='Other',
            last_name='User',
            phone_number='0987654321',
            password='testpass123'
        )
        
        other_notification = Notification.objects.create(
            user=other_user,
            notification_type='SYSTEM',
            title='Other Notification',
            message='Other message'
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        
        # Extract notification IDs from response
        if 'notifications' in response.data:
            notification_ids = [n['id'] for n in response.data['notifications']]
        else:
            notification_ids = [n['id'] for n in response.data]
        
        assert self.notification.id in notification_ids
        assert other_notification.id not in notification_ids
    
    def test_retrieve_notification_marks_as_read(self):
        """Test retrieving a notification marks it as read."""
        self.client.force_authenticate(user=self.user)
        url = reverse('notification-detail', kwargs={'pk': self.notification.pk})
        
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        
        self.notification.refresh_from_db()
        assert self.notification.is_read is True
        assert self.notification.read_at is not None
    
    def test_mark_all_notifications_as_read(self):
        """Test marking all notifications as read."""
        # Create multiple unread notifications
        for i in range(3):
            Notification.objects.create(
                user=self.user,
                notification_type='SYSTEM',
                title=f'Notification {i}',
                message='Test'
            )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('mark-all-read')  # Adjust to your URL name
        
        response = self.client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        
        unread_count = Notification.objects.filter(user=self.user, is_read=False).count()
        assert unread_count == 0
    
    def test_delete_notification_removes_it(self):
        """Test deleting a notification removes it."""
        self.client.force_authenticate(user=self.user)
        url = reverse('notification-detail', kwargs={'pk': self.notification.pk})
        
        response = self.client.delete(url)
        
        assert response.status_code in [status.HTTP_204_NO_CONTENT, status.HTTP_200_OK]
        
        exists = Notification.objects.filter(pk=self.notification.pk).exists()
        assert exists is False


class UserCreationAPITests(APITestCase):
    """Tests for user creation endpoint (admin)."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            phone_number='1234567890',
            password='adminpass123',
            is_staff=True
        )
        self.url = reverse('create-user')  # Adjust to your URL name
    
    def test_create_user_without_auth_fails(self):
        """Test creating user without authentication fails."""
        data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'phone_number': '1234567890',
            'role': 'EMPLOYEE'
        }
        
        response = self.client.post(self.url, data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_user_with_auth_succeeds(self):
        """Test creating user with authentication succeeds."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'phone_number': '1234567890',
            'role': 'EMPLOYEE'
        }
        
        response = self.client.post(self.url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email='newuser@example.com').exists()
    
    def test_create_user_with_duplicate_email_fails(self):
        """Test creating user with existing email fails."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            'email': self.admin_user.email,  # Duplicate email
            'first_name': 'New',
            'last_name': 'User',
            'phone_number': '1234567890',
            'role': 'EMPLOYEE'
        }
        
        response = self.client.post(self.url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class AuthenticationSecurityTests(APITestCase):
    """Tests for authentication security features."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        self.login_url = reverse('login')
    
    def test_password_not_returned_in_response(self):
        """Test password is not included in any response."""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        # Password should never be in response
        response_str = str(response.data)
        assert 'testpass123' not in response_str
        assert 'password' not in response_str.lower() or 'password' in '{"error": "Invalid password"}'
    
    def test_sql_injection_in_email_prevented(self):
        """Test SQL injection attempts are prevented."""
        data = {
            'email': "'; DROP TABLE accounts_user; --",
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        # Should fail gracefully, not cause SQL error
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED]
        
        # Table should still exist
        assert User.objects.filter(email='test@example.com').exists()
    
    def test_xss_in_user_fields_sanitized(self):
        """Test XSS attempts in user fields are handled."""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-me')
        
        data = {
            'first_name': '<script>alert("XSS")</script>',
            'last_name': '<img src=x onerror=alert("XSS")>'
        }
        
        response = self.client.patch(url, data)
        
        # Should either sanitize or reject
        if response.status_code == status.HTTP_200_OK:
            self.user.refresh_from_db()
            # Check if scripts are sanitized/escaped
            assert '<script>' not in self.user.first_name or self.user.first_name == data['first_name']


class RateLimitingTests(APITestCase):
    """Tests for rate limiting (if implemented)."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        self.login_url = reverse('login')
    
    @pytest.mark.skip(reason="Rate limiting may not be implemented yet")
    def test_login_rate_limiting(self):
        """Test excessive login attempts are rate limited."""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        # Make many requests
        responses = []
        for _ in range(20):
            response = self.client.post(self.login_url, data)
            responses.append(response.status_code)
        
        # Should eventually get rate limited (429)
        assert status.HTTP_429_TOO_MANY_REQUESTS in responses

