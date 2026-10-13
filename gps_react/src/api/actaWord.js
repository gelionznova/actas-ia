import { BASE_API } from "../utils/constants";
import { authFetch } from "./request";
import { fetchActaVersions } from "./meetingSessionActaVersion";

/**
 * Descarga el acta en Word. El endpoint exige el token, asi que se pide como
 * blob y se entrega al navegador; un enlace directo devolveria 401.
 */
export async function descargarActaWord(versionId, token, nombre) {
  const url = `${BASE_API}/api/meeting-session-acta-versions/${versionId}/descargar_word/`;
  const res = await authFetch(url, token);
  if (!res.ok) throw new Error("No se pudo generar el documento Word.");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = objectUrl;
  enlace.download = nombre || `Acta_${versionId}.docx`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(objectUrl);
}

/**
 * Busca la ultima version de acta de una sesion y la descarga.
 */
export async function descargarActaDeSesion(session, token) {
  const versiones = await fetchActaVersions(session.id, token);
  if (!Array.isArray(versiones) || !versiones.length) {
    throw new Error("Esta sesión todavía no tiene un acta guardada.");
  }
  const ultima = versiones[0];
  const titulo = (session.meeting_title || "Acta").replace(/[\\/:*?"<>|]/g, "-");
  await descargarActaWord(ultima.id, token, `${titulo}_v${ultima.version}.docx`);
}
