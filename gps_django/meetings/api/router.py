# meetings/api/router.py

from rest_framework.routers import DefaultRouter
from meetings.api.views import (
    MeetingViewSet,
    MeetingSessionViewSet,
    MeetingPhotoViewSet,
    MeetingSessionActaVersionViewSet,
)

router_meeting = DefaultRouter()
router_meeting.register(r"meetings", MeetingViewSet, basename="meeting")
router_meeting.register(r"meeting-sessions", MeetingSessionViewSet, basename="meeting-session")
router_meeting.register(r"meeting-photos", MeetingPhotoViewSet, basename="meeting-photo")
router_meeting.register(r"meeting-session-acta-versions", MeetingSessionActaVersionViewSet, basename="meeting-session-acta-version")
