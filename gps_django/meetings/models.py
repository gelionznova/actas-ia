# meetings/models.py

from django.db import models
from django.conf import settings
from django.utils.text import get_valid_filename

def upload_to_audio(instance, filename):
    # El titulo se limpia porque llega desde el formulario y puede traer
    # caracteres que no son validos en un nombre de archivo.
    titulo = get_valid_filename(instance.meeting.title or "reunion") or "reunion"
    return f"meetings/audio/{titulo[:60]}_{get_valid_filename(filename)}"

class Meeting(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meetings"
    )
    title = models.CharField(max_length=200)  # Nombre de la reunión
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cover_photo = models.ForeignKey(
        "MeetingPhoto",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="as_cover_for_meetings"
    )

    def __str__(self):
        return self.title

class MeetingSession(models.Model):
    ACTA_STATUS_CHOICES = [
        ("pending", "En proceso"),
        ("generated", "Acta generada"),
        ("error", "Error al generar acta")
    ]

    meeting = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
        related_name="sessions"
    )
    start_datetime = models.DateTimeField()  # Fecha y hora inicio
    end_datetime = models.DateTimeField()    # Fecha y hora fin
    audio_file = models.FileField(
        upload_to=upload_to_audio,
        blank=True,
        null=True
    )
    acta_status = models.CharField(
        max_length=10,
        choices=ACTA_STATUS_CHOICES,
        default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Sesión: {self.meeting.title} - {self.start_datetime.strftime('%Y-%m-%d %H:%M')}"

class MeetingPhoto(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="meetings/photos/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Foto de {self.meeting.title}"

class MeetingSessionActaVersion(models.Model):
    session = models.ForeignKey(
        "MeetingSession",
        on_delete=models.CASCADE,
        related_name="acta_versions"
    )
    version = models.PositiveIntegerField(default=1)
    ciudad = models.CharField(max_length=100, blank=True, null=True)
    lugar = models.CharField(max_length=200, blank=True, null=True)
    enlace = models.URLField(blank=True, null=True)
    centro = models.CharField(max_length=200, blank=True, null=True)
    agenda = models.JSONField(default=list, blank=True)
    objetivos = models.JSONField(default=list, blank=True)
    desarrollo = models.TextField(blank=True, null=True)    # Aquí va la transcripción del audio
    conclusiones = models.TextField(blank=True, null=True)
    content_html = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    word_file = models.FileField(
        upload_to="meetings/actas/",
        blank=True,
        null=True
    )

    def __str__(self):
        return f"Acta v{self.version} de sesión {self.session.id}"

    @property
    def meeting_title(self):
        # Útil para Django Admin o para usarlo en el serializador
        return self.session.meeting.title if self.session and self.session.meeting else ""

    class Meta:
        ordering = ['-version', '-created_at']

# TABLAS RELACIONADAS: COMPROMISOS Y ASISTENTES

class ActaCompromiso(models.Model):
    acta_version = models.ForeignKey(
        MeetingSessionActaVersion,
        on_delete=models.CASCADE,
        related_name='compromisos'
    )
    actividad = models.CharField(max_length=400)
    fecha = models.CharField(max_length=40, blank=True, null=True)
    responsable = models.CharField(max_length=100, blank=True, null=True)
    firma = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Compromiso: {self.actividad}"

class ActaAsistente(models.Model):
    acta_version = models.ForeignKey(
        MeetingSessionActaVersion,
        on_delete=models.CASCADE,
        related_name='asistentes'
    )
    nombre = models.CharField(max_length=150)
    dependencia = models.CharField(max_length=150, blank=True, null=True)
    aprueba = models.CharField(max_length=10, blank=True, null=True)
    observacion = models.CharField(max_length=400, blank=True, null=True)
    firma = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Asistente: {self.nombre}"
