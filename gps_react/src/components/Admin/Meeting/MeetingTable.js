import React, { useRef, useState, useEffect } from "react";
import { Button, Icon, Label, Modal } from "semantic-ui-react";
import { useAuth } from "../../../hooks/useAuth";
import { useMeeting } from "../../../hooks/useMeeting";
import { useMeetingPhoto } from "../../../hooks/useMeetingPhoto";
import { BASE_API } from "../../../utils/constants";
import { authFetch } from "../../../api/request";
import "./MeetingTable.scss";
import { toast } from "react-toastify";

export function MeetingTable({
  meetings,
  updateMeeting,
  deleteMeeting,
  onRefetch,
}) {
  const { auth } = useAuth();
  const { addSession, deleteSession } = useMeeting();

  // Estado local de fotos (fotos SOLO de la reunión seleccionada)
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Estados para el modal y selección
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);

  // API de fotos (solo funciones)
  const { getPhotos, addPhoto, deletePhoto } = useMeetingPhoto();

  // Grabación de sesión
  const [recordingId, setRecordingId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  useEffect(
    () => () => {
      const recorder = mediaRecorderRef.current;
      if (recorder) {
        recorder.onstop = null;
        if (recorder.state !== "inactive") recorder.stop();
        recorder.stream.getTracks().forEach((track) => track.stop());
      }
    },
    [],
  );

  // --- SESIONES (audios) ---
  const handleRecord = async (meetingId) => {
    if (recordingId === meetingId) {
      mediaRecorderRef.current.stop();
      setRecordingId(null);
    } else {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        toast.error(
          "No se pudo acceder al micrófono. Revisa los permisos del navegador.",
        );
        return;
      }
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

      recorder.onstop = async () => {
        const endTime = new Date().toISOString();
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File(
          [blob],
          `grabacion_${Date.now()}.${mimeType.includes("mp4") ? "m4a" : "webm"}`,
          {
            type: mimeType,
          },
        );

        const formData = new FormData();
        formData.append("meeting", meetingId);
        formData.append("start_datetime", startTimeRef.current);
        formData.append("end_datetime", endTime);
        formData.append("audio_file", file);

        recorder.stream.getTracks().forEach((track) => track.stop());
        try {
          await addSession(formData, auth.token);
          toast.success("Sesión guardada.");
          onRefetch?.();
        } catch (e) {
          toast.error(e.message);
        }
      };

      startTimeRef.current = new Date().toISOString();
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingId(meetingId);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const confirmDelete = window.confirm("¿Eliminar esta sesión?");
    if (!confirmDelete) return;

    try {
      await deleteSession(sessionId, auth.token);
      onRefetch?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // --- FOTOS ---
  const handleOpenPhotoModal = async (meeting) => {
    setSelectedMeeting(meeting);
    setShowPhotoModal(true);
    setSelectedPhotoId(null);
    setFiles([]);
    setPhotos([]); // Limpia al abrir
    setLoadingPhotos(true);
    try {
      const result = await getPhotos(meeting.id, auth.token);
      setPhotos(result);
    } catch {
      setPhotos([]);
    }
    setLoadingPhotos(false);
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setFiles([]);
    setSelectedMeeting(null);
    setSelectedPhotoId(null);
    setPhotos([]); // Limpia al cerrar
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUploadPhotos = async () => {
    if (!files.length || !selectedMeeting) return;
    setUploading(true);
    try {
      for (let file of files) {
        const formData = new FormData();
        formData.append("meeting", selectedMeeting.id);
        formData.append("image", file);
        await addPhoto(formData, auth.token);
      }
      // Recarga solo las fotos de la reunión actual
      setLoadingPhotos(true);
      try {
        const result = await getPhotos(selectedMeeting.id, auth.token);
        setPhotos(result);
      } catch {
        setPhotos([]);
      }
      setLoadingPhotos(false);
      setFiles([]);
      toast.success("Fotos cargadas correctamente.");
    } catch (error) {
      toast.error(error.message || "No se pudieron cargar las fotos.");
    } finally {
      setUploading(false);
    }
  };

  // --- PORTADA ---
  const handleSetCoverPhoto = async (meetingId, photoId) => {
    try {
      const response = await authFetch(
        `${BASE_API}/api/meetings/${meetingId}/set_cover_photo/`,
        auth.token,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo_id: photoId }),
        },
      );

      if (response.ok) {
        if (typeof onRefetch === "function") onRefetch();
        setSelectedPhotoId(null);
        setShowPhotoModal(false);
        toast.success("Portada actualizada.");
      } else {
        toast.error(
          "No se pudo establecer la portada. Selecciona otra foto o intenta de nuevo.",
        );
      }
    } catch (error) {
      toast.error("Error en la petición: " + error.message);
    }
  };

  const onDeletePhoto = async (photo) => {
    const result = window.confirm(`¿Eliminar Foto?`);
    if (!result) return;
    try {
      await deletePhoto(photo.id);
      const refreshed = await getPhotos(selectedMeeting.id, auth.token);
      setPhotos(refreshed);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="meeting-container">
      {meetings.map((meeting) => (
        <div key={meeting.id} className="meeting-card">
          {meeting.cover_photo?.image ? (
            <img
              src={meeting.cover_photo.image}
              alt={`Portada de ${meeting.title}`}
              className="meeting-image"
            />
          ) : (
            <div className="meeting-placeholder" aria-hidden="true">
              <Icon name="calendar alternate outline" />
            </div>
          )}

          <div className="meeting-header">
            <h2>{meeting.title}</h2>
            <p>{meeting.description || "Sin descripción"}</p>
          </div>

          <div className="meeting-sessions">
            {meeting.sessions.length === 0 ? (
              <span className="no-session">Sin sesiones aún</span>
            ) : (
              meeting.sessions.map((session) => (
                <div key={session.id} className="session-item">
                  <Label size="mini" color="blue">
                    Inicio
                  </Label>{" "}
                  {new Date(session.start_datetime).toLocaleString()}
                  <br />
                  <Label size="mini" color="teal">
                    Fin
                  </Label>{" "}
                  {new Date(session.end_datetime).toLocaleString()}
                  <br />
                  <button
                    className="delete-session-btn"
                    title="Eliminar sesión"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Icon name="trash" />
                  </button>
                  {session.audio_file ? (
                    <audio controls src={session.audio_file} />
                  ) : (
                    <em>Sin audio</em>
                  )}
                  <br />
                </div>
              ))
            )}
          </div>

          <div className="meeting-actions">
            <Button
              icon
              size="small"
              color={recordingId === meeting.id ? "red" : "green"}
              disabled={recordingId !== null && recordingId !== meeting.id}
              onClick={() => handleRecord(meeting.id)}
              title={recordingId === meeting.id ? "Detener" : "Grabar sesión"}
            >
              {recordingId === meeting.id ? "Detener" : "Grabar sesión"}
              <Icon name={recordingId === meeting.id ? "stop" : "microphone"} />
            </Button>
            <Button
              title="Actualizar reunión"
              icon
              size="small"
              onClick={() => updateMeeting(meeting)}
            >
              <Icon name="edit" />
            </Button>
            <Button
              title="Eliminar reunión"
              icon
              color="red"
              size="small"
              onClick={() => deleteMeeting(meeting)}
            >
              <Icon name="trash" />
            </Button>
            <Button
              icon
              size="small"
              color="blue"
              title="Subir fotos de la reunión"
              onClick={() => handleOpenPhotoModal(meeting)}
            >
              <Icon name="folder open" />
            </Button>
          </div>
        </div>
      ))}

      {/* MODAL DE FOTOS */}
      <Modal
        open={showPhotoModal}
        onClose={handleClosePhotoModal}
        size="small"
        closeIcon
        className="photo-modal"
      >
        <Modal.Header>
          Fotos de la reunión
          {selectedMeeting ? `: ${selectedMeeting.title}` : ""}
        </Modal.Header>
        <Modal.Content>
          {/* <div style={{ color: "red", fontWeight: "bold", marginBottom: 8 }}>
            DEBUG: Fotos que ves ({photos.length}) - ids:{" "}
            {photos.map((p) => p.id).join(", ")}
            {selectedMeeting && ` | Meeting id: ${selectedMeeting.id}`}
          </div> */}
          <input
            type="file"
            accept="image/*"
            multiple
            aria-label="Seleccionar fotos de la reunión"
            onChange={handleFileChange}
          />
          <Button
            onClick={handleUploadPhotos}
            loading={uploading}
            disabled={!files.length || uploading}
          >
            Subir
          </Button>
          <div
            className="photo-gallery"
            style={{ marginTop: 16, marginBottom: 12 }}
          >
            {loadingPhotos ? (
              <div>Cargando fotos...</div>
            ) : (
              photos.map((photo) => (
                <div
                  className={`photo-thumb-wrapper${
                    selectedPhotoId === photo.id ? " selected" : ""
                  }`}
                  key={photo.id}
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    marginRight: 8,
                    border:
                      selectedPhotoId === photo.id
                        ? "2px solid #2185d0"
                        : "none",
                    borderRadius: 8,
                    display: "inline-block",
                  }}
                >
                  <img
                    src={photo.image}
                    alt="Foto subida"
                    className="photo-thumb"
                    onClick={() => setSelectedPhotoId(photo.id)}
                  />

                  {/* Icono de portada */}
                  {selectedMeeting?.cover_photo?.id === photo.id && (
                    <Icon
                      name="check circle"
                      color="green"
                      size="large"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "#fff",
                        borderRadius: "50%",
                      }}
                      title="Portada actual"
                    />
                  )}

                  {/* Botón eliminar en esquina inferior derecha */}
                  <Button
                    icon
                    circular
                    size="mini"
                    color="red"
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      zIndex: 10,
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // evita que seleccione la foto
                      onDeletePhoto(photo);
                    }}
                  >
                    <Icon name="trash" />
                  </Button>
                </div>
              ))
            )}
          </div>
          <Button
            color="green"
            disabled={
              !selectedPhotoId ||
              selectedMeeting?.cover_photo?.id === selectedPhotoId
            }
            onClick={() =>
              handleSetCoverPhoto(selectedMeeting.id, selectedPhotoId)
            }
          >
            Establecer como portada
          </Button>
        </Modal.Content>
      </Modal>
    </div>
  );
}
