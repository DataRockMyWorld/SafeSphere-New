"""
Factory classes for generating test data for accounts app.
Uses factory_boy and faker for realistic test data generation.
"""
import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from accounts.models import Notification

User = get_user_model()


class UserFactory(DjangoModelFactory):
    """Factory for creating User instances."""
    
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    phone_number = factory.Faker('phone_number')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    
    role = 'EMPLOYEE'
    position = 'TECHNICIAN'
    department = 'OPERATIONS'
    
    is_active = True
    is_staff = False
    is_superuser = False


class HSSEManagerFactory(UserFactory):
    """Factory for creating HSSE Manager users."""
    
    position = 'HSSE MANAGER'
    role = 'MANAGER'
    department = 'HSSE'


class OPSManagerFactory(UserFactory):
    """Factory for creating OPS Manager users."""
    
    position = 'OPS MANAGER'
    role = 'MANAGER'
    department = 'OPERATIONS'


class MDFactory(UserFactory):
    """Factory for creating MD users."""
    
    position = 'MD'
    role = 'ADMIN'


class FinanceManagerFactory(UserFactory):
    """Factory for creating Finance Manager users."""
    
    position = 'FINANCE MANAGER'
    role = 'MANAGER'
    department = 'FINANCE'


class SuperUserFactory(UserFactory):
    """Factory for creating superuser instances."""
    
    is_staff = True
    is_superuser = True
    position = 'MD'
    role = 'ADMIN'


class NotificationFactory(DjangoModelFactory):
    """Factory for creating Notification instances."""
    
    class Meta:
        model = Notification
    
    user = factory.SubFactory(UserFactory)
    notification_type = 'SYSTEM'
    title = factory.Faker('sentence', nb_words=5)
    message = factory.Faker('paragraph', nb_sentences=3)
    is_read = False


class WelcomeNotificationFactory(NotificationFactory):
    """Factory for creating welcome notifications."""
    
    notification_type = 'WELCOME'
    title = 'Welcome to SafeSphere!'
    message = factory.LazyAttribute(
        lambda obj: f"Welcome to SafeSphere, {obj.user.first_name}!"
    )


class ChangeRequestNotificationFactory(NotificationFactory):
    """Factory for creating change request notifications."""
    
    notification_type = 'CHANGE_REQUEST'
    title = 'New Change Request Submitted'
    message = 'A new change request has been submitted for review.'

