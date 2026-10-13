# meetings/api/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.core.files.base import ContentFile
import logging
import pytz
from PIL import Image

from meetings.models import (
    Meeting, MeetingSession, MeetingPhoto,
    MeetingSessionActaVersion, ActaCompromiso, ActaAsistente
)
from meetings.api.serializers import (
    MeetingSerializer, MeetingSessionSerializer, MeetingPhotoSerializer,
    MeetingSessionActaVersionSerializer
)
from meetings.utils.transcription import transcribe_audio
from meetings.utils.word_generation import generate_word_acta

logger = logging.getLogger(__name__)

def is_valid_image(path):
    try:
        with Image.open(path) as img:
            img.verify()
        return True
    except Exception:
        return False

# --- MEETING ---
class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Meeting.objects.filter(user=user)
            .select_related("cover_photo")
            .prefetch_related("sessions", "photos")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def set_cover_photo(self, request, pk=None):
        meeting = self.get_object()
        photo_id = request.data.get("photo_id")
        if not photo_id:
            return Response({"error": "Se requiere 'photo_id'"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            photo = MeetingPhoto.objects.get(id=photo_id, meeting=meeting)
            meeting.cover_photo = photo
            meeting.save()
            return Response(self.get_serializer(meeting).data)
        except MeetingPhoto.DoesNotExist:
            return Response({"error": "Foto no encontrada para esta reunión"}, status=status.HTTP_404_NOT_FOUND)

# --- MEETING SESSION ---
class MeetingSessionViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MeetingSession.objects.filter(meeting__user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        meeting = serializer.validated_data['meeting']
        if meeting.user != request.user:
            raise PermissionDenied("No tienes permiso para agregar sesiones a esta reunión.")
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def generar_acta(self, request, pk=None):
        session = self.get_object()
        if not session.audio_file:
            return Response({"error": "No hay archivo de audio en esta sesión"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Transcripción
        try:
            texto = transcribe_audio(session.audio_file.path)
        except Exception as e:
            logger.error(f"[generar_acta] Transcripción falló: {e}", exc_info=True)
            return Response({"error": "Fallo al transcribir audio", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 2. Contexto para plantilla
        bogota_tz = pytz.timezone("America/Bogota")
        fotos = MeetingPhoto.objects.filter(meeting=session.meeting)
        anexos = [
            {
                "image_path": photo.image.path,
                "filename": photo.image.name.split("/")[-1],
            }
            for photo in fotos if is_valid_image(photo.image.path)
        ]

        last_acta = MeetingSessionActaVersion.objects.filter(session=session).order_by('-version').first()
        siguiente_version = last_acta.version + 1 if last_acta else 1

        context = {
            "numero": siguiente_version,
            "reunion": session.meeting.title,
            "fecha": session.start_datetime.astimezone(bogota_tz).strftime("%d/%m/%Y"),
            "hora_inicio": session.start_datetime.astimezone(bogota_tz).strftime("%I:%M:%S %p"),
            "hora_fin": session.end_datetime.astimezone(bogota_tz).strftime("%I:%M:%S %p"),
            "ciudad": last_acta.ciudad if last_acta else "",
            "lugar": last_acta.lugar if last_acta else "",
            "enlace": last_acta.enlace if last_acta else "",
            "centro": last_acta.centro if last_acta else "",
            "agenda": last_acta.agenda if last_acta else [],
            "objetivos": last_acta.objetivos if last_acta else [],
            "desarrollo": texto,
            "conclusiones": last_acta.conclusiones if last_acta else "",
            "compromisos": [
                {
                    "actividad": c.actividad,
                    "fecha": c.fecha,
                    "responsable": c.responsable,
                    "firma": c.firma,
                }
                for c in last_acta.compromisos.all()
            ] if last_acta else [],
            "asistentes": [
                {
                    "nombre": a.nombre,
                    "dependencia": a.dependencia,
                    "aprueba": a.aprueba,
                    "observacion": a.observacion,
                    "firma": a.firma,
                }
                for a in last_acta.asistentes.all()
            ] if last_acta else [],
            "anexos": anexos,
        }

        # 3. Generación de Word
        try:
            word_stream = generate_word_acta(context)
            word_stream.seek(0)
            filename = f"Acta_Sesion_{session.id}.docx"
        except Exception as e:
            logger.error(f"[generar_acta] Generación de .docx falló: {e}", exc_info=True)
            return Response({"error": "Fallo al generar documento Word", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4. Guardar versión de acta
        try:
            acta_v = MeetingSessionActaVersion.objects.create(
                session=session,
                version=siguiente_version,
                content_html=f"<p>{texto}</p>",
                created_by=request.user,
                ciudad=context["ciudad"],
                lugar=context["lugar"],
                enlace=context["enlace"],
                centro=context["centro"],
                agenda=context["agenda"],
                objetivos=context["objetivos"],
                desarrollo=context["desarrollo"],
                conclusiones=context["conclusiones"],
            )
            acta_v.word_file.save(filename, ContentFile(word_stream.read()))
            acta_v.save()
            # Crea compromisos/asistentes si existen en el contexto
            for c in context.get("compromisos", []):
                acta_v.compromisos.create(**c)
            for a in context.get("asistentes", []):
                acta_v.asistentes.create(**a)
        except Exception as e:
            logger.error(f"[generar_acta] Guardar versión falló: {e}", exc_info=True)
            return Response({"error": "No se pudo guardar la versión del acta", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 5. Actualizar estado de la sesión
        session.acta_status = "generated"
        session.save()

        return Response({"msg": "Acta generada correctamente", "acta_version_id": acta_v.id}, status=status.HTTP_200_OK)

# --- MEETING PHOTO ---
class MeetingPhotoViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = MeetingPhoto.objects.filter(meeting__user=self.request.user)
        meeting_id = self.request.query_params.get("meeting")
        if meeting_id:
            qs = qs.filter(meeting_id=meeting_id)
        return qs

# --- ACTA VERSION ---
class MeetingSessionActaVersionViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSessionActaVersionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = (
            MeetingSessionActaVersion.objects
            .filter(session__meeting__user=user)
            .select_related("session__meeting")
            .prefetch_related("compromisos", "asistentes")
        )
        session_id = self.request.query_params.get("session")
        if session_id:
            qs = qs.filter(session_id=session_id)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        session = serializer.validated_data["session"]
        last = MeetingSessionActaVersion.objects.filter(session=session).order_by('-version').first()
        version = last.version + 1 if last else 1
        serializer.save(created_by=self.request.user, version=version)
        session.acta_status = 'generated'
        session.save(update_fields=['acta_status'])

    @action(detail=True, methods=["get"])
    def descargar_word(self, request, pk=None):
        acta = self.get_object()
        fotos = MeetingPhoto.objects.filter(meeting=acta.session.meeting)
        anexos = [
            {
                "image_path": photo.image.path,
                "filename": photo.image.name.split("/")[-1],
            }
            for photo in fotos if is_valid_image(photo.image.path)
        ]
        context = {
            "numero": acta.version,
            "reunion": acta.session.meeting.title,
            "fecha": acta.session.start_datetime.strftime("%d/%m/%Y") if acta.session.start_datetime else "",
            "hora_inicio": acta.session.start_datetime.strftime("%I:%M:%S %p") if acta.session.start_datetime else "",
            "hora_fin": acta.session.end_datetime.strftime("%I:%M:%S %p") if acta.session.end_datetime else "",
            "ciudad": acta.ciudad or "",
            "lugar": acta.lugar or "",
            "enlace": acta.enlace or "",
            "centro": acta.centro or "",
            "agenda": acta.agenda or [],
            "objetivos": acta.objetivos or [],
            "desarrollo": acta.desarrollo or "",
            "conclusiones": acta.conclusiones or "",
            "compromisos": [
                {
                    "actividad": c.actividad,
                    "fecha": c.fecha,
                    "responsable": c.responsable,
                    "firma": c.firma,
                }
                for c in acta.compromisos.all()
            ],
            "asistentes": [
                {
                    "nombre": a.nombre,
                    "dependencia": a.dependencia,
                    "aprueba": a.aprueba,
                    "observacion": a.observacion,
                    "firma": a.firma,
                }
                for a in acta.asistentes.all()
            ],
            "anexos": anexos,
        }
        word_stream = generate_word_acta(context)
        word_stream.seek(0)
        from django.http import FileResponse
        return FileResponse(
            word_stream,
            as_attachment=True,
            filename=f"Acta_{acta.session.id}_v{acta.version}.docx"
        )
