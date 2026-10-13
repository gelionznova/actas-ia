import { useState, useEffect, useCallback } from "react";
import { getMeetingsApi } from "../api/meeting";
import { useAuth } from "./useAuth";

/**
 * Hook que devuelve todas las sesiones de todas las reuniones del usuario autenticado.
 */
export function useActas() {
  const { auth } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoiza fetchSessions para que no cambie en cada render
  const fetchSessions = useCallback(async () => {
    if (!auth?.token) return;
    setLoading(true);
    setError(null);
    try {
      const meetings = await getMeetingsApi(auth.token);
      const allSessions = meetings.flatMap((m) =>
        (m.sessions || []).map((s) => ({
          ...s,
          meeting_title: m.title || "Sin título",
          meeting_id: m.id,
        }))
      );
      setSessions(allSessions);
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, reload: fetchSessions };
}
