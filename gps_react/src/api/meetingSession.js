import { BASE_API } from "../utils/constants";
import { authFetch } from "./request";

// === MEETING SESSIONS ===

const url = (ruta) => `${BASE_API}/api/meeting-sessions/${ruta}`;

/**
 * Trae TODAS las sesiones de todas tus reuniones (normalmente para listados/tabla).
 */
export async function getMeetingSessionsApi(token) {
  const response = await authFetch(url(""), token);
  if (!response.ok) throw new Error("Error obteniendo sesiones de reunión");
  return await response.json();
}

/**
 * Trae UNA sesión por ID (para ActaEditorPage y obtener datos originales de la sesión).
 */
export async function getMeetingSessionApi(sessionId, token) {
  const response = await authFetch(url(`${sessionId}/`), token);
  if (!response.ok) throw new Error("No se pudo cargar la sesión");
  return await response.json();
}

/**
 * Crea una nueva sesión de reunión. Usa FormData si incluyes audio.
 */
export async function addMeetingSessionApi(data, token) {
  // Sin Content-Type: el navegador pone el boundary del FormData.
  const response = await authFetch(url(""), token, { method: "POST", body: data });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "No se pudo crear la sesión");
  }
  return await response.json();
}

/**
 * Elimina una sesión por ID.
 */
export async function deleteMeetingSessionApi(id, token) {
  const response = await authFetch(url(`${id}/`), token, { method: "DELETE" });
  if (response.status !== 204) throw new Error("No se pudo eliminar la sesión");
  return true;
}
