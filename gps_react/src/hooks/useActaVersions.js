import { useState, useEffect } from "react";
import {
  fetchActaVersions,
  createActaVersion,
  updateActaVersion,
} from "../api/meetingSessionActaVersion";

/**
 * Hook para manejar versiones de acta de una sesión.
 * Devuelve { versions, loading, save, lastVersion }
 */
export function useActaVersions(sessionId, token) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar versiones cada vez que sessionId o token cambian
  useEffect(() => {
    if (
      !sessionId ||
      !token ||
      typeof sessionId !== "string" ||
      sessionId === "undefined"
    ) {
      setVersions([]);
      return;
    }

    const loadVersions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchActaVersions(sessionId, token);
        setVersions(Array.isArray(data) ? data : []);
      } catch (err) {
        setVersions([]);
        setError(
          "No se pudieron cargar las versiones del acta. Vuelve a intentarlo.",
        );
        console.error("Error cargando versiones de acta:", err);
      } finally {
        setLoading(false);
      }
    };
    loadVersions();
  }, [sessionId, token]);

  /**
   * Guarda la versión actual del acta.
   * Si hay versión, actualiza. Si no, crea.
   * Recibe actaData con todos los campos (incluyendo compromisos y asistentes).
   */
  const save = async (actaData) => {
    if (!sessionId || !token) throw new Error("No sessionId/token");
    let result;
    if (versions.length > 0) {
      result = await updateActaVersion(versions[0].id, actaData, token);
    } else {
      result = await createActaVersion(sessionId, actaData, token);
    }
    // Refresca después de guardar
    const data = await fetchActaVersions(sessionId, token);
    setVersions(Array.isArray(data) ? data : []);
    return result;
  };

  return {
    versions,
    loading,
    error,
    save,
    lastVersion: versions[0] || null,
  };
}
