import { BASE_API } from "../utils/constants";

// === MEETINGS ===

export async function getMeetingsApi(token) {
  try {
    const url = `${BASE_API}/api/meetings/`;
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

export async function addMeetingApi(data, token) {
  try {
    const url = `${BASE_API}/api/meetings/`;
    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(url, params);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function updateMeetingApi(id, data, token) {
  try {
    const url = `${BASE_API}/api/meetings/${id}/`;
    const params = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(url, params);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function deleteMeetingApi(id, token) {
  try {
    const url = `${BASE_API}/api/meetings/${id}/`;
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
