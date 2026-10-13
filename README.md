# Actas IA

Aplicación para gestionar usuarios, reuniones y actas, con transcripción de audio y generación de documentos Word.

El repositorio reúne la API desarrollada con Django y la interfaz desarrollada con React.

## Estructura del proyecto

| Carpeta | Contenido |
| --- | --- |
| `gps_django/` | API, modelos, migraciones, transcripción y generación de actas. |
| `gps_react/` | Interfaz web para administrar usuarios, reuniones y actas. |

## Requisitos

- Python 3.11 para usar las dependencias de desarrollo local.
- Node.js y npm para ejecutar la interfaz web.
- Conexión a Internet para instalar dependencias y descargar el modelo de transcripción cuando no esté disponible localmente.

## Ejecutar la API en Windows

Desde la raíz del repositorio, abre PowerShell y ejecuta:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r gps_django\requirements-local.txt
cd gps_django
..\.venv\Scripts\python.exe manage.py migrate --settings=gps.settings_local
..\.venv\Scripts\python.exe manage.py createsuperuser --settings=gps.settings_local
..\.venv\Scripts\python.exe manage.py runserver --settings=gps.settings_local
```

La configuración `gps.settings_local` usa SQLite y guarda los datos en `gps_django/db.local.sqlite3`.

- API: <http://127.0.0.1:8000/api/>
- Administración de Django: <http://127.0.0.1:8000/admin/>
- Documentación de la API: <http://127.0.0.1:8000/docs/>

## Ejecutar la interfaz web

En otra terminal, desde la raíz del repositorio:

```powershell
cd gps_react
npm install
npm start
```

Abre <http://localhost:3000> en el navegador. Mantén la API en ejecución mientras usas la aplicación.

La dirección de la API se define en `gps_react/src/utils/constants.js` mediante `BASE_API`. Actualmente apunta a `http://127.0.0.1:8000`.

Consulta el [README de la interfaz](gps_react/README.md) para conocer los demás comandos disponibles.

## Transcripción de audio

La aplicación usa `faster-whisper`. En desarrollo local utiliza el modelo `small` con CPU. Si la carpeta del modelo indicada en `gps_django/gps/settings_local.py` existe, carga el modelo desde allí; de lo contrario, intenta descargarlo la primera vez que se transcribe un audio.

## Archivos locales

El `.gitignore` excluye entornos virtuales, dependencias, bases de datos SQLite, archivos subidos y resultados de compilación. Cada instalación debe crear su base de datos y sus usuarios.

Los comandos anteriores utilizan la configuración de desarrollo local. La configuración de despliegue se encuentra en `gps_django/gps/settings.py`.
