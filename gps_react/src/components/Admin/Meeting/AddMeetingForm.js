import React, { useState } from "react";
import { Form, Button, Message } from "semantic-ui-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks";
import { useMeeting } from "../../../hooks/useMeeting";
export function AddMeetingForm({ onClose, onRefetch, meeting }) {
  const { auth } = useAuth();
  const { addMeeting, updateMeeting } = useMeeting();
  const [data, setData] = useState({
      title: meeting?.title || "",
      description: meeting?.description || "",
    }),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const submit = async () => {
    if (!data.title.trim()) {
      setError("Escribe un título para la reunión.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...data, title: data.title.trim() };
      if (meeting) await updateMeeting(meeting.id, payload, auth.token);
      else await addMeeting(payload, auth.token);
      toast.success(meeting ? "Reunión actualizada." : "Reunión creada.");
      onRefetch();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Form onSubmit={submit}>
      <p className="muted">
        Define el propósito de la reunión. Podrás agregar sesiones y fotos
        después.
      </p>
      <Form.Input
        id="meeting-title"
        label="Título de la reunión"
        name="title"
        placeholder="Ej. Comité de seguimiento"
        maxLength={200}
        required
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
      />
      <Form.TextArea
        id="meeting-description"
        label="Descripción (opcional)"
        name="description"
        placeholder="¿Qué temas se van a tratar?"
        rows={4}
        value={data.description}
        onChange={(e) => setData({ ...data, description: e.target.value })}
      />
      {error && (
        <Message negative role="alert">
          {error}
        </Message>
      )}
      <div className="form-actions">
        <Button type="button" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button primary type="submit" loading={saving} disabled={saving}>
          {meeting ? "Guardar cambios" : "Crear reunión"}
        </Button>
      </div>
    </Form>
  );
}
