#!/bin/bash
set -o errexit

echo "Running migrations..."
python manage.py migrate

echo "Creating test users..."
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()

test_users = [
    {'email': 'test@example.com', 'username': 'testuser', 'password': 'TestPassword123', 'first_name': 'Test'},
    {'email': 'demo@example.com', 'username': 'demouser', 'password': 'DemoPassword123', 'first_name': 'Demo'},
]

for user_data in test_users:
    email = user_data.pop('email')
    password = user_data.pop('password')
    if not User.objects.filter(email=email).exists():
        User.objects.create_user(email=email, password=password, **user_data)
        print(f'✓ Created {email}')
    else:
        print(f'⚠ {email} already exists')
EOF

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Build complete!"
