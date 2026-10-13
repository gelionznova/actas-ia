import { useState, useCallback } from "react";
import {
  getMeetingsApi,
  addMeetingApi,
  updateMeetingApi,
  deleteMeetingApi,
} from "../api/meeting";
import {
  getMeetingSessionsApi,
  addMeetingSessionApi,
  deleteMeetingSessionApi,
} from "../api/meetingSession";
export function useMeeting() {
  const [meetings, setMeetings] = useState([]),
    [sessions, setSessions] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(null);
  const getMeetings = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      setMeetings(await getMeetingsApi(token));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  const getSessions = useCallback(
    async (token) => setSessions(await getMeetingSessionsApi(token)),
    [],
  );
  return {
    meetings,
    sessions,
    loading,
    error,
    getMeetings,
    getSessions,
    addMeeting: addMeetingApi,
    updateMeeting: updateMeetingApi,
    deleteMeeting: deleteMeetingApi,
    addSession: addMeetingSessionApi,
    deleteSession: deleteMeetingSessionApi,
  };
}
