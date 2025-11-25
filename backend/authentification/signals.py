from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(post_migrate)
def create_test_users(sender, **kwargs):
    """Create test users after migrations are applied."""
    if sender.name != 'authentification':
        return
    
    test_users = [
        {'email': 'test@example.com', 'username': 'testuser', 'password': 'TestPassword123', 'first_name': 'Test'},
        {'email': 'demo@example.com', 'username': 'demouser', 'password': 'DemoPassword123', 'first_name': 'Demo'},
    ]
    
    for user_data in test_users:
        email = user_data['email']
        username = user_data['username']
        
        # Check if user exists by email or username
        if not User.objects.filter(email=email).exists() and not User.objects.filter(username=username).exists():
            try:
                User.objects.create_user(**user_data)
                print(f'✓ Created test user: {email}')
            except Exception as e:
                print(f'⚠ Failed to create user {email}: {e}')
        else:
            # User already exists, update if needed
            pass
