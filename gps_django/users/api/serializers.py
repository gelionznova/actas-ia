from rest_framework import serializers
from users.models import User


class UserSerializer(serializers.ModelSerializer):
    is_online = serializers.SerializerMethodField()

    def get_is_online(self, user):
        from django.utils import timezone
        return bool(user.last_activity and user.last_activity > timezone.now() - timezone.timedelta(minutes=5))

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        if value:
            validate_password(value, self.instance)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'La contraseña es obligatoria.'})
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save(update_fields=['password'])
        return instance

    class Meta:
        model = User
        extra_kwargs = {'password': {'write_only': True, 'required': False, 'allow_blank': True}, 'last_activity': {'read_only': True}}
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "is_active",
            "is_staff",
            "last_activity",
            "is_online",
        ]
