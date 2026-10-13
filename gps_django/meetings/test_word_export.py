"""Pruebas de la exportacion a Word.

El documento generado perdia los compromisos, los asistentes y la ciudad, y
metia el HTML del editor dentro del XML. Estas pruebas fijan ese comportamiento.
"""
import re
import zipfile
from datetime import timedelta
from xml.dom import minidom

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from meetings.models import Meeting, MeetingSession, MeetingSessionActaVersion
from meetings.utils.word_generation import generate_word_acta, html_a_richtext


def texto_del_documento(datos):
    xml = zipfile.ZipFile(datos).read("word/document.xml").decode("utf-8")
    minidom.parseString(xml)  # falla si el XML no es valido
    return xml, re.sub(r"<[^>]+>", "", xml)


class WordExportTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="autor", email="autor@example.test")
        self.meeting = Meeting.objects.create(user=self.user, title="Comite de calidad")
        ahora = timezone.now()
        self.session = MeetingSession.objects.create(
            meeting=self.meeting,
            start_datetime=ahora,
            end_datetime=ahora + timedelta(hours=1),
        )
        self.acta = MeetingSessionActaVersion.objects.create(
            session=self.session,
            ciudad="Popayan",
            centro="CGMLTI",
            desarrollo="<p>Se reviso el <b>avance</b></p><p>Segundo punto</p>",
            conclusiones="<p>Todo conforme</p>",
        )
        self.acta.compromisos.create(
            actividad="Entregar informe", fecha="30/09", responsable="Ana", firma="AR"
        )
        self.acta.asistentes.create(
            nombre="Ana Ruiz", dependencia="Calidad", aprueba="SI",
            observacion="Sin novedad", firma="AR",
        )
        self.client.force_authenticate(self.user)

    def descargar(self):
        respuesta = self.client.get(
            f"/api/meeting-session-acta-versions/{self.acta.id}/descargar_word/"
        )
        self.assertEqual(respuesta.status_code, 200)
        return b"".join(respuesta.streaming_content)

    def test_el_documento_incluye_compromisos_y_asistentes(self):
        from io import BytesIO

        _xml, texto = texto_del_documento(BytesIO(self.descargar()))
        for esperado in ("Entregar informe", "Ana", "Ana Ruiz", "Calidad", "Sin novedad"):
            self.assertIn(esperado, texto)

    def test_el_documento_usa_la_ciudad_del_acta(self):
        from io import BytesIO

        _xml, texto = texto_del_documento(BytesIO(self.descargar()))
        self.assertIn("Popayan", texto)
        # La plantilla traia asistentes de otra entidad escritos a mano.
        self.assertNotIn("SOLUCIONES INTEGRALES", texto)

    def test_el_html_del_editor_no_se_inyecta_en_el_xml(self):
        from io import BytesIO

        xml, texto = texto_del_documento(BytesIO(self.descargar()))
        self.assertNotIn("<p>", xml)
        self.assertIn("Se reviso el", texto)
        self.assertIn("avance", texto)
        self.assertIn("Segundo punto", texto)

    def test_texto_plano_sin_html_se_conserva(self):
        rico = html_a_richtext("Linea uno\nLinea dos")
        self.assertIn("Linea uno", rico.xml)
        self.assertIn("Linea dos", rico.xml)
        self.assertIn("<w:br/>", rico.xml)

    def test_caracteres_especiales_se_escapan(self):
        rico = html_a_richtext("Costos & margenes <alto>")
        self.assertIn("&amp;", rico.xml)
        self.assertNotIn("<alto>", rico.xml)

    def test_generar_word_no_falla_sin_datos(self):
        documento = generate_word_acta(
            {"reunion": "", "agenda": [], "objetivos": [], "compromisos": [],
             "asistentes": [], "anexos": [], "desarrollo": None, "conclusiones": None}
        )
        self.assertTrue(documento.getvalue().startswith(b"PK"))
