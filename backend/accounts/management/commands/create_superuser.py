from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Clear existing superusers and create a new one'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Username for the new superuser'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@safespheres.info',
            help='Email for the new superuser'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the new superuser'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Admin',
            help='First name for the new superuser'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='User',
            help='Last name for the new superuser'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        with transaction.atomic():
            # Delete all existing superusers
            superusers = User.objects.filter(is_superuser=True)
            count = superusers.count()
            superusers.delete()
            
            self.stdout.write(
                self.style.SUCCESS(f'Deleted {count} existing superuser(s)')
            )

            # Create new superuser
            try:
                user = User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name
                )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created new superuser:\n'
                        f'Username: {username}\n'
                        f'Email: {email}\n'
                        f'Password: {password}\n'
                        f'Name: {first_name} {last_name}'
                    )
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to create superuser: {e}')
                )
                raise
