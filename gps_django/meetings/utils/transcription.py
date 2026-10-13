"""Transcripcion de audio a texto.

Usa faster-whisper cuando esta disponible, porque decodifica el audio con PyAV
y no necesita FFmpeg instalado en el sistema. Si el entorno tiene el paquete
openai-whisper original, se usa como alternativa.
"""
import logging
import os

from django.conf import settings

logger = logging.getLogger(__name__)

_modelo = None
_motor = None


def _ruta_modelo_local():
    ruta = getattr(settings, "WHISPER_MODEL_PATH", None)
    if ruta and os.path.isdir(ruta):
        return ruta
    return None


def _cargar_modelo(model_size):
    """Devuelve (motor, modelo) y lo conserva para las siguientes llamadas."""
    global _modelo, _motor
    if _modelo is not None:
        return _motor, _modelo

    tamano = model_size or getattr(settings, "WHISPER_MODEL_SIZE", "small")
    errores = []

    try:
        from faster_whisper import WhisperModel

        origen = _ruta_modelo_local() or tamano
        _modelo = WhisperModel(
            origen,
            device=getattr(settings, "WHISPER_DEVICE", "cpu"),
            compute_type=getattr(settings, "WHISPER_COMPUTE_TYPE", "int8"),
        )
        _motor = "faster-whisper"
        logger.info("Transcripcion lista con faster-whisper (%s)", origen)
        return _motor, _modelo
    except ImportError as e:
        errores.append(f"faster-whisper: {e}")
    except Exception as e:
        errores.append(f"faster-whisper: {e}")
        logger.warning("No se pudo iniciar faster-whisper: %s", e)

    try:
        import whisper

        _modelo = whisper.load_model(tamano)
        _motor = "openai-whisper"
        logger.info("Transcripcion lista con openai-whisper (%s)", tamano)
        return _motor, _modelo
    except ImportError as e:
        errores.append(f"openai-whisper: {e}")
    except Exception as e:
        errores.append(f"openai-whisper: {e}")

    raise RuntimeError(
        "No hay un motor de transcripcion disponible. Instala faster-whisper "
        "con: pip install faster-whisper. Detalle: " + " | ".join(errores)
    )


def get_whisper_model(model_size="small"):
    """Compatibilidad con el codigo anterior: devuelve solo el modelo."""
    return _cargar_modelo(model_size)[1]


def transcribe_audio(file_path, model_size=None, idioma="es"):
    """Transcribe un archivo de audio a texto. Lanza RuntimeError si falla."""
    if not file_path or not os.path.exists(file_path):
        raise RuntimeError(f"No se encontro el archivo de audio: {file_path}")

    motor, modelo = _cargar_modelo(model_size)
    try:
        if motor == "faster-whisper":
            segmentos, _info = modelo.transcribe(
                file_path, language=idioma, vad_filter=False
            )
            return " ".join(s.text.strip() for s in segmentos).strip()
        return modelo.transcribe(file_path, language=idioma)["text"].strip()
    except Exception as e:
        logger.error("Error al transcribir %s: %s", file_path, e, exc_info=True)
        raise RuntimeError(
            "No se pudo transcribir el audio. Revisa que el archivo sea valido."
        ) from e
