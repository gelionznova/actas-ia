// src/api/meetingSessionActa.js
import { BASE_API } from "../utils/constants";

export async function generarActaApi(sessionId, token) {
  const res = await fetch(
    `${BASE_API}/api/meeting-sessions/${sessionId}/generar_acta/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error generando acta");
  }
  return res.json();
}

export async function fetchActaVersionsApi(sessionId, token) {
  const res = await fetch(
    `${BASE_API}/api/meeting-session-acta-versions/?session=${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Error cargando versiones de acta");
  }
  return res.json();
}
