from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class UserSecurityTests(APITestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_superuser(username='admin', email='admin@example.test', password='Original-Password-983!')
        self.client.force_authenticate(self.admin)

    def test_password_is_never_returned(self):
        self.assertNotIn('password', self.client.get('/api/auth/me/').data)
        self.assertNotIn('password', self.client.get('/api/users/').data[0])

    def test_create_hashes_password_and_allows_login(self):
        response = self.client.post('/api/users/', {'username': 'new', 'email': 'new@example.test', 'password': 'Strong-Password-948!', 'is_active': True})
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('password', response.data)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.post('/api/auth/login/', {'email': 'new@example.test', 'password': 'Strong-Password-948!'}).status_code, 200)

    def test_blank_password_preserves_existing_password(self):
        response = self.client.patch(f'/api/users/{self.admin.id}/', {'password': '', 'first_name': 'Nombre'})
        self.assertEqual(response.status_code, 200)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.check_password('Original-Password-983!'))

    def test_update_password_is_hashed(self):
        response = self.client.patch(f'/api/users/{self.admin.id}/', {'password': 'Changed-Password-634!'})
        self.assertEqual(response.status_code, 200)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.check_password('Changed-Password-634!'))

    def test_regular_user_cannot_list_users(self):
        user = get_user_model().objects.create_user(username='reader', email='reader@example.test')
        self.client.force_authenticate(user)
        self.assertEqual(self.client.get('/api/users/').status_code, 403)
