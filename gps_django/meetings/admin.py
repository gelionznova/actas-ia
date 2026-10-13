from django.contrib import admin
from .models import (
    Meeting, MeetingSession, MeetingPhoto, MeetingSessionActaVersion,
    ActaCompromiso, ActaAsistente
)

class MeetingSessionInline(admin.TabularInline):
    model = MeetingSession
    extra = 1
    fields = ('start_datetime', 'end_datetime', 'audio_file', 'acta_status')
    readonly_fields = ()

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'description', 'created_at')
    search_fields = ('title', 'user__username')
    list_filter = ('user',)
    inlines = [MeetingSessionInline]

@admin.register(MeetingSession)
class MeetingSessionAdmin(admin.ModelAdmin):
    list_display = (
        'meeting', 'get_meeting_title', 'start_datetime', 'end_datetime', 'acta_status'
    )
    list_filter = ('meeting', 'acta_status')
    search_fields = ('meeting__title',)

    @admin.display(description='Nombre Reunión')
    def get_meeting_title(self, obj):
        return obj.meeting.title

class ActaCompromisoInline(admin.TabularInline):
    model = ActaCompromiso
    extra = 0

class ActaAsistenteInline(admin.TabularInline):
    model = ActaAsistente
    extra = 0

@admin.register(MeetingSessionActaVersion)
class MeetingSessionActaVersionAdmin(admin.ModelAdmin):
    list_display = (
        'get_meeting_title', 'get_session_date', 'version',
        'created_by', 'created_at'
    )
    list_filter = ('session__meeting', 'created_by')
    search_fields = ('session__meeting__title',)
    inlines = [ActaCompromisoInline, ActaAsistenteInline]

    @admin.display(description='Reunión')
    def get_meeting_title(self, obj):
        return obj.session.meeting.title if obj.session and obj.session.meeting else '-'

    @admin.display(description='Fecha sesión')
    def get_session_date(self, obj):
        return obj.session.start_datetime.strftime('%Y-%m-%d %H:%M') if obj.session else '-'

@admin.register(MeetingPhoto)
class MeetingPhotoAdmin(admin.ModelAdmin):
    list_display = ('meeting', 'image', 'uploaded_at')
    list_filter = ('meeting',)
