from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Notification, SystemSetting, WaterIntakeEntry


class AdminPanelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='regular', email='reg@example.com', password='password123')
        self.admin = User.objects.create_superuser(username='administrator', email='admin@example.com', password='adminpassword')
        self.client = APIClient()

    def test_regular_user_cannot_access_admin_stats(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/admin/dashboard/stats/')
        self.assertEqual(response.status_code, 403)

    def test_admin_can_access_admin_stats(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/admin/dashboard/stats/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('total_users', response.data)

    def test_admin_can_change_settings(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'app_name': 'Super Water Intake Pro',
            'default_daily_goal_ml': '3000'
        }
        response = self.client.post('/api/admin/settings/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        setting = SystemSetting.objects.get(key='app_name')
        self.assertEqual(setting.value, 'Super Water Intake Pro')

    def test_admin_global_search(self):
        WaterIntakeEntry.objects.create(user=self.user, date='2026-01-01', amount_ml=500)
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/admin/search/', {'q': 'regular'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data['users']) >= 1)

    def test_admin_can_send_notifications(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'title': 'Drink Water Now',
            'message': 'Keep your hydration levels high today!',
            'type': 'reminder'
        }
        response = self.client.post('/api/admin/notifications/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Notification.objects.filter(title='Drink Water Now').exists())
