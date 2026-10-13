from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from meetings.models import Meeting, MeetingSession, MeetingSessionActaVersion, MeetingPhoto


class OwnershipTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.owner = User.objects.create_user(username='owner', email='owner@example.test')
        self.other = User.objects.create_user(username='other', email='other@example.test')
        self.meeting = Meeting.objects.create(user=self.owner, title='Privada')
        self.other_meeting = Meeting.objects.create(user=self.other, title='Ajena')
        now = timezone.now()
        self.session = MeetingSession.objects.create(meeting=self.meeting, start_datetime=now, end_datetime=now+timedelta(hours=1))
        self.other_session = MeetingSession.objects.create(meeting=self.other_meeting, start_datetime=now, end_datetime=now+timedelta(hours=1))
        self.client.force_authenticate(self.owner)

    def test_cannot_create_acta_for_other_user(self):
        response = self.client.post('/api/meeting-session-acta-versions/', {'session': self.other_session.id}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(MeetingSessionActaVersion.objects.count(), 0)

    def test_cannot_move_acta_to_other_user(self):
        acta = MeetingSessionActaVersion.objects.create(session=self.session)
        response = self.client.patch(f'/api/meeting-session-acta-versions/{acta.id}/', {'session': self.other_session.id}, format='json')
        self.assertEqual(response.status_code, 400)
        acta.refresh_from_db()
        self.assertEqual(acta.session_id, self.session.id)

    def test_cannot_move_photo_to_other_user(self):
        photo = MeetingPhoto.objects.create(meeting=self.meeting, image='test-placeholder.png')
        response = self.client.patch(f'/api/meeting-photos/{photo.id}/', {'meeting': self.other_meeting.id}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_other_meeting_not_visible(self):
        self.assertEqual(self.client.get(f'/api/meetings/{self.other_meeting.id}/').status_code, 404)

    def test_reversed_session_dates_rejected(self):
        response = self.client.patch(f'/api/meeting-sessions/{self.session.id}/', {'end_datetime': self.session.start_datetime.isoformat()}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_owner_can_create_and_edit_acta(self):
        response = self.client.post('/api/meeting-session-acta-versions/', {'session': self.session.id, 'desarrollo': 'Contenido'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.session.refresh_from_db()
        self.assertEqual(self.session.acta_status, 'generated')
        response = self.client.patch(f"/api/meeting-session-acta-versions/{response.data['id']}/", {'desarrollo': 'Actualizado'}, format='json')
        self.assertEqual(response.status_code, 200)


class RobustezTests(APITestCase):
    """Casos que rompian el guardado o dejaban campos editables de mas."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='autor2', email='autor2@example.test')
        self.client.force_authenticate(self.user)

    def test_titulo_con_caracteres_invalidos_no_rompe_la_ruta_del_audio(self):
        from meetings.models import upload_to_audio

        meeting = Meeting.objects.create(user=self.user, title='Comite 10:30 */? "A"')
        now = timezone.now()
        session = MeetingSession(
            meeting=meeting, start_datetime=now, end_datetime=now + timedelta(hours=1)
        )
        ruta = upload_to_audio(session, 'grabacion.webm')
        self.assertTrue(ruta.startswith('meetings/audio/'))
        for caracter in ':*?"<>|':
            self.assertNotIn(caracter, ruta)

    def test_el_cliente_no_puede_marcar_una_sesion_como_generada(self):
        meeting = Meeting.objects.create(user=self.user, title='Reunion')
        now = timezone.now()
        session = MeetingSession.objects.create(
            meeting=meeting, start_datetime=now, end_datetime=now + timedelta(hours=1)
        )
        respuesta = self.client.patch(
            f'/api/meeting-sessions/{session.id}/',
            {'acta_status': 'generated'},
            format='json',
        )
        self.assertEqual(respuesta.status_code, 200)
        session.refresh_from_db()
        self.assertEqual(session.acta_status, 'pending')

    def test_cada_acta_guardada_recibe_una_version_nueva(self):
        meeting = Meeting.objects.create(user=self.user, title='Reunion')
        now = timezone.now()
        session = MeetingSession.objects.create(
            meeting=meeting, start_datetime=now, end_datetime=now + timedelta(hours=1)
        )
        primera = self.client.post(
            '/api/meeting-session-acta-versions/',
            {'session': session.id, 'desarrollo': 'A'}, format='json')
        segunda = self.client.post(
            '/api/meeting-session-acta-versions/',
            {'session': session.id, 'desarrollo': 'B'}, format='json')
        self.assertEqual(primera.data['version'], 1)
        self.assertEqual(segunda.data['version'], 2)
