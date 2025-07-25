from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test user with a known password for development/testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='test@example.com',
            help='Email for the test user'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='testpass123',
            help='Password for the test user'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Test',
            help='First name for the test user'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='User',
            help='Last name for the test user'
        )
        parser.add_argument(
            '--phone',
            type=str,
            default='1234567890',
            help='Phone number for the test user'
        )
        parser.add_argument(
            '--role',
            type=str,
            default='EMPLOYEE',
            choices=['ADMIN', 'MANAGER', 'EMPLOYEE'],
            help='Role for the test user'
        )
        parser.add_argument(
            '--position',
            type=str,
            default='TECHNICIAN',
            choices=['MD', 'OPS MANAGER', 'FINANCE MANAGER', 'HSSE MANAGER', 'TECHNICIAN'],
            help='Position for the test user'
        )
        parser.add_argument(
            '--department',
            type=str,
            default='OPERATIONS',
            choices=['OPERATIONS', 'MARKETING', 'HSSE', 'FINANCE'],
            help='Department for the test user'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        phone = options['phone']
        role = options['role']
        position = options['position']
        department = options['department']

        try:
            with transaction.atomic():
                # Check if user already exists
                if User.objects.filter(email=email).exists():
                    user = User.objects.get(email=email)
                    user.set_password(password)
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Updated existing user {email} with new password: {password}'
                        )
                    )
                else:
                    # Create new user with known password
                    user = User.objects.create_user(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        phone_number=phone,
                        role=role,
                        position=position,
                        department=department,
                        is_active=True,
                        is_staff=False,
                        is_superuser=False
                    )
                    
                    # Override the password with the known password
                    user.set_password(password)
                    user.save()
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created test user {email} with password: {password}'
                        )
                    )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'User details:\n'
                        f'  Email: {user.email}\n'
                        f'  Name: {user.get_full_name}\n'
                        f'  Role: {user.role}\n'
                        f'  Position: {user.position}\n'
                        f'  Department: {user.department}\n'
                        f'  Password: {password}'
                    )
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create test user: {str(e)}')
            ) 