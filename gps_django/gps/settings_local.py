"""Configuracion de desarrollo local, independiente del SQL Server original."""
from .settings import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.local.sqlite3",
    }
}
# En local DEBUG activo: runserver sirve /uploads/ y /static/.
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

# Transcripcion local: modelo faster-whisper descargado en .local-models/
WHISPER_MODEL_PATH = str(BASE_DIR.parent.parent / ".local-models" / "faster-whisper-small")
WHISPER_MODEL_SIZE = "small"
WHISPER_DEVICE = "cpu"
WHISPER_COMPUTE_TYPE = "int8"
