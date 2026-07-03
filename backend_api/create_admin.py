#!/usr/bin/env python
"""Create admin user for testing"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'waterintake_api.settings')
django.setup()

from django.contrib.auth.models import User

try:
    # Try to create new admin user
    if not User.objects.filter(username='admin').exists():
        user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
        print(f'✅ Admin user created successfully!')
        print(f'Username: admin')
        print(f'Password: admin123')
        print(f'Email: admin@test.com')
    else:
        # Update existing admin password
        user = User.objects.get(username='admin')
        user.set_password('admin123')
        user.save()
        print(f'✅ Admin user already exists, password updated to: admin123')
except Exception as e:
    print(f'❌ Error: {str(e)}')
