from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from users.models import User
from users.api.serializers import UserSerializer
from django.utils import timezone

class UserApiViewSet(ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()



class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        # Solo se toca la marca de actividad, no toda la fila.
        request.user.last_activity = timezone.now()
        request.user.save(update_fields=["last_activity"])
        return Response(serializer.data)


class UserStatusView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Considera al usuario en línea si su última actividad fue hace menos de 5 minutos
            online_threshold = timezone.now() - timezone.timedelta(minutes=5)
            is_online = bool(user.last_activity and user.last_activity > online_threshold)
            return Response({"is_online": is_online})
        except User.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
