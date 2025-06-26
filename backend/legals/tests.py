from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import LawCategory, LawResource, LegalRegisterEntry

User = get_user_model()

def get_test_user_kwargs(username, position):
    return {
        'username': username,
        'password': 'testpass',
        'email': f'{username}@example.com',
        'first_name': username.capitalize(),
        'last_name': 'User',
        'phone_number': '1234567890',
        'position': position,
    }

class LegalAPITestCase(APITestCase):
    def setUp(self):
        self.hsse_manager = User.objects.create_user(**get_test_user_kwargs('hsse', 'HSSE MANAGER'))
        self.regular_user = User.objects.create_user(**get_test_user_kwargs('user', 'EMPLOYEE'))
        self.category = LawCategory.objects.create(name='Health', description='Health laws')
        self.law_resource_data = {
            'title': 'Test Law',
            'country': 'GH',
            'category': self.category.id,
            'jurisdiction': 'national',
            'is_repealed': False,
            'summary': 'A test law',
        }
        self.legal_register_data = {
            'title': 'Register Entry',
            'country': 'GH',
            'category': 'Health',
            'legal_obligation': 'Comply with Test Law',
        }

    def test_lawresource_crud_hsse_manager(self):
        self.client.login(username='hsse', password='testpass')
        # Create
        url = reverse('lawresource-list-create')
        response = self.client.post(url, self.law_resource_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        law_id = response.data['id']
        # Read
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Update
        detail_url = reverse('lawresource-detail', args=[law_id])
        response = self.client.patch(detail_url, {'summary': 'Updated summary'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)  # Only PUT/PATCH allowed for HSSE
        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_lawresource_read_regular_user(self):
        self.client.login(username='hsse', password='testpass')
        url = reverse('lawresource-list-create')
        create_resp = self.client.post(url, self.law_resource_data)
        self.client.logout()
        self.client.login(username='user', password='testpass')
        # Read
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Try to create (should fail)
        response = self.client.post(url, self.law_resource_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_lawresource_filtering(self):
        self.client.login(username='hsse', password='testpass')
        url = reverse('lawresource-list-create')
        self.client.post(url, self.law_resource_data)
        # Filter by country
        response = self.client.get(url + '?country=GH')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_legalregisterentry_crud_hsse_manager(self):
        self.client.login(username='hsse', password='testpass')
        # Create a law resource first
        law_url = reverse('lawresource-list-create')
        law_resp = self.client.post(law_url, self.law_resource_data)
        law_id = law_resp.data['id']
        self.legal_register_data['law_resource'] = law_id
        # Create register entry
        url = reverse('legalregisterentry-list-create')
        response = self.client.post(url, self.legal_register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        entry_id = response.data['id']
        # Read
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Update
        detail_url = reverse('legalregisterentry-detail', args=[entry_id])
        response = self.client.patch(detail_url, {'legal_obligation': 'Updated obligation'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)  # Only PUT/PATCH allowed for HSSE
        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_legalregisterentry_read_regular_user(self):
        self.client.login(username='hsse', password='testpass')
        law_url = reverse('lawresource-list-create')
        law_resp = self.client.post(law_url, self.law_resource_data)
        law_id = law_resp.data['id']
        self.legal_register_data['law_resource'] = law_id
        url = reverse('legalregisterentry-list-create')
        self.client.post(url, self.legal_register_data)
        self.client.logout()
        self.client.login(username='user', password='testpass')
        # Read
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Try to create (should fail)
        response = self.client.post(url, self.legal_register_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_legalregisterentry_filtering(self):
        self.client.login(username='hsse', password='testpass')
        law_url = reverse('lawresource-list-create')
        law_resp = self.client.post(law_url, self.law_resource_data)
        law_id = law_resp.data['id']
        self.legal_register_data['law_resource'] = law_id
        url = reverse('legalregisterentry-list-create')
        self.client.post(url, self.legal_register_data)
        # Filter by country
        response = self.client.get(url + '?country=GH')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
