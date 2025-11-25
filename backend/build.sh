#!/bin/bash
set -o errexit

echo "Running migrations..."
python manage.py migrate

echo "Creating test users..."
python manage.py create_test_users

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Build complete!"
