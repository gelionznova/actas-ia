// src/api/meetingSessionActa.js

import { BASE_API } from "../utils/constants";

/**
 * Llama al endpoint que genera el acta para una sesión.
 * @param {number|string} sessionId - ID de la sesión de reunión.
 * @param {string} [token] - Token de autenticación (Bearer).
 * @returns {Promise<object>} - JSON de respuesta del servidor.
 */
export async function generarActaApi(sessionId, token) {
  const url = `${BASE_API}/api/meeting-sessions/${sessionId}/generar_acta/`;
  const params = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(url, params);
  if (!response.ok) {
    let errMsg = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errMsg = errorData.detail || errorData.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  return response.json();
}
