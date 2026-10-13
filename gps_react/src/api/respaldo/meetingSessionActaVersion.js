// src/api/meetingSessionActaVersion.js
import { BASE_API } from "../utils/constants";

export async function getActaVersionsApi(sessionId, token) {
  const url = `${BASE_API}/api/meeting-session-acta-versions/?session=${sessionId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudieron cargar las versiones");
  return res.json();
}

export async function updateActaVersionApi(versionId, contentHtml, token) {
  const url = `${BASE_API}/api/meeting-session-acta-versions/${versionId}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content_html: contentHtml }),
  });
  if (!res.ok) throw new Error("Error al guardar cambios");
  return res.json();
}
