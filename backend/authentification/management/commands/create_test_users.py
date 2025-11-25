from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users for development and testing'

    def handle(self, *args, **options):
        test_users = [
            {
                'email': 'test@example.com',
                'username': 'testuser',
                'password': 'TestPassword123',
                'first_name': 'Test',
            },
            {
                'email': 'demo@example.com',
                'username': 'demouser',
                'password': 'DemoPassword123',
                'first_name': 'Demo',
            },
        ]

        for user_data in test_users:
            email = user_data.pop('email')
            password = user_data.pop('password')
            
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    **user_data
                )
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created user: {user.email}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠ User already exists: {email}')
                )

        # List all users
        self.stdout.write(self.style.SUCCESS('\nAll users in database:'))
        for user in User.objects.all():
            self.stdout.write(f'  - {user.email} (active: {user.is_active})')
