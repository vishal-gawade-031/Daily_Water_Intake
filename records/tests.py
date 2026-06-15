from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import WaterIntakeEntry


class WaterIntakeEntryTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='password123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_second_intake_is_added_to_todays_total(self):
        first_response = self.client.post('/api/entries/', {'amount_ml': 250}, format='json')
        second_response = self.client.post('/api/entries/', {'amount_ml': 500}, format='json')

        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(second_response.data['amount_ml'], 750)

        entries = WaterIntakeEntry.objects.filter(user=self.user, date=timezone.now().date())
        self.assertEqual(entries.count(), 1)
        self.assertEqual(entries.get().amount_ml, 750)

    def test_posted_date_is_ignored_and_current_date_is_used(self):
        response = self.client.post(
            '/api/entries/',
            {'date': '2000-01-01', 'amount_ml': 300},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['date'], str(timezone.now().date()))
