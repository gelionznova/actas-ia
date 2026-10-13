// src/api/meetingSessionActaVersion.js
import { BASE_API } from "../utils/constants";
import { authFetch } from "./request";

/**
 * Obtiene todas las versiones de acta para una sesión dada.
 * GET /api/meeting-session-acta-versions/?session=:sessionId
 */
export async function fetchActaVersions(sessionId, token) {
  const url = `${BASE_API}/api/meeting-session-acta-versions/?session=${sessionId}`;
  const res = await authFetch(url, token);
  if (!res.ok) throw new Error("No se pudieron cargar las versiones de acta");
  return await res.json();
}

/**
 * Crea una nueva versión de acta para la sesión dada.
 * POST /api/meeting-session-acta-versions/
 */
export async function createActaVersion(sessionId, actaData, token) {
  const url = `${BASE_API}/api/meeting-session-acta-versions/`;
  const res = await authFetch(url, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session: sessionId,
      ...actaData, // Aquí incluyes compromisos y asistentes como arrays
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al crear nueva versión de acta");
  }
  return await res.json();
}

/**
 * Actualiza el contenido completo de una versión existente de acta.
 * PATCH /api/meeting-session-acta-versions/:versionId/
 */
export async function updateActaVersion(versionId, actaData, token) {
  const url = `${BASE_API}/api/meeting-session-acta-versions/${versionId}/`;
  const res = await authFetch(url, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actaData), // ahora envías todos los campos
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al actualizar la versión de acta");
  }
  return await res.json();
}
