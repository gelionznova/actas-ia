import { BASE_API } from "../utils/constants";

// === MEETING SESSIONS ===

export async function getMeetingSessionsApi(token) {
  try {
    const url = `${BASE_API}/api/meeting-sessions/`;
    const params = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(url, params);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addMeetingSessionApi(data, token) {
  try {
    const url = `${BASE_API}/api/meeting-sessions/`;
    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data, // FormData si incluye audio
    };

    const response = await fetch(url, params);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function deleteMeetingSessionApi(id, token) {
  try {
    const url = `${BASE_API}/api/meeting-sessions/${id}/`;
    const params = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(url, params);
    return response.status === 204;
  } catch (error) {
    throw error;
  }
}
