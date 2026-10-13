import { BASE_API } from "../utils/constants";
import { authFetch } from "./request";

/**
 * Genera una nueva acta a partir del audio de la sesión.
 */
export async function generarActaApi(sessionId, token) {
  const url = `${BASE_API}/api/meeting-sessions/${sessionId}/generar_acta/`;
  const res = await authFetch(url, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // El backend responde {error, detalle}: el detalle dice si falta el motor
    // de transcripcion o si el audio no se pudo leer.
    const partes = [err.error, err.detalle].filter(Boolean);
    throw new Error(partes.join(": ") || "Error generando acta");
  }
  return await res.json();
}
