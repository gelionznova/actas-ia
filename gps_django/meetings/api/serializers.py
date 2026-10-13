# meetings/api/serializers.py

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from meetings.models import (
    Meeting, MeetingSession, MeetingPhoto,
    MeetingSessionActaVersion, ActaCompromiso, ActaAsistente
)

class MeetingPhotoSerializer(serializers.ModelSerializer):
    def validate_meeting(self, value):
        if value.user_id != self.context['request'].user.id:
            raise ValidationError('No puedes agregar fotos a reuniones de otro usuario.')
        return value

    class Meta:
        model = MeetingPhoto
        fields = "__all__"

class MeetingSessionSerializer(serializers.ModelSerializer):
    meeting_title = serializers.CharField(source="meeting.title", read_only=True)

    class Meta:
        model = MeetingSession
        fields = '__all__'
        # acta_status lo fija el backend al generar o guardar un acta.
        read_only_fields = ['id', 'meeting_title', 'acta_status']

    def validate_meeting(self, value):
        request = self.context.get("request")
        if request and value.user != request.user:
            raise ValidationError("No puedes asignar sesiones a reuniones de otro usuario.")
        return value

    def validate(self, attrs):
        start = attrs.get('start_datetime', getattr(self.instance, 'start_datetime', None))
        end = attrs.get('end_datetime', getattr(self.instance, 'end_datetime', None))
        if start and end and end <= start:
            raise ValidationError({'end_datetime': 'La fecha de fin debe ser posterior al inicio.'})
        return attrs

class MeetingSerializer(serializers.ModelSerializer):
    sessions = MeetingSessionSerializer(many=True, read_only=True)
    photos = MeetingPhotoSerializer(many=True, read_only=True)
    cover_photo = MeetingPhotoSerializer(read_only=True)

    class Meta:
        model = Meeting
        fields = '__all__'
        read_only_fields = ['id', 'user', 'cover_photo']

# ---- SERIALIZADORES PARA COMPROMISOS Y ASISTENTES ----

class ActaCompromisoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActaCompromiso
        fields = ['id', 'actividad', 'fecha', 'responsable', 'firma']

class ActaAsistenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActaAsistente
        fields = ['id', 'nombre', 'dependencia', 'aprueba', 'observacion', 'firma']

# ---- SERIALIZER DE VERSIÓN DE ACTA ----

class MeetingSessionActaVersionSerializer(serializers.ModelSerializer):
    def validate_session(self, value):
        if value.meeting.user_id != self.context['request'].user.id:
            raise ValidationError('No puedes crear o mover actas a sesiones de otro usuario.')
        return value

    compromisos = ActaCompromisoSerializer(many=True, required=False)
    asistentes = ActaAsistenteSerializer(many=True, required=False)
    meeting_title = serializers.CharField(source="session.meeting.title", read_only=True)
    session_start = serializers.DateTimeField(source="session.start_datetime", read_only=True)
    session_end = serializers.DateTimeField(source="session.end_datetime", read_only=True)
    reunion = serializers.SerializerMethodField()  # <-- Nuevo campo

    class Meta:
        model = MeetingSessionActaVersion
        fields = [
            'id', 'session', 'version',
            'ciudad', 'lugar', 'enlace', 'centro',
            'agenda', 'objetivos', 'desarrollo', 'conclusiones', 'content_html',
            'created_by', 'created_at', 'word_file',
            'compromisos', 'asistentes','reunion',
            # Campos auxiliares para el frontend:
            'meeting_title', 'session_start', 'session_end',
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'version', 'word_file','reunion',
            'meeting_title', 'session_start', 'session_end',
        ]

    def get_reunion(self, obj):
        # Protege de que session o meeting puedan ser None
        try:
            return obj.session.meeting.title
        except Exception:
            return ""

    def create(self, validated_data):
        compromisos_data = validated_data.pop('compromisos', [])
        asistentes_data = validated_data.pop('asistentes', [])
        acta = MeetingSessionActaVersion.objects.create(**validated_data)
        for c in compromisos_data:
            ActaCompromiso.objects.create(acta_version=acta, **c)
        for a in asistentes_data:
            ActaAsistente.objects.create(acta_version=acta, **a)
        return acta

    def update(self, instance, validated_data):
        compromisos_data = validated_data.pop('compromisos', None)
        asistentes_data = validated_data.pop('asistentes', None)

        # Actualiza los campos simples
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Solo actualiza si se mandan en el payload
        if compromisos_data is not None:
            instance.compromisos.all().delete()
            for c in compromisos_data:
                ActaCompromiso.objects.create(acta_version=instance, **c)

        if asistentes_data is not None:
            instance.asistentes.all().delete()
            for a in asistentes_data:
                ActaAsistente.objects.create(acta_version=instance, **a)

        return instance
