from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    last_activity = models.DateTimeField(default=timezone.now, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
