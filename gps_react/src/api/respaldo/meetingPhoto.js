import { BASE_API } from "../utils/constants";

// Obtener fotos de una reunión
export async function getMeetingPhotosApi(meetingId, token) {
  const url = `${BASE_API}/api/meeting-photos/?meeting=${meetingId}`;
  const params = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await fetch(url, params);
  return await response.json();
}

// Subir foto/s (recibe FormData)
export async function addMeetingPhotoApi(formData, token) {
  const url = `${BASE_API}/api/meeting-photos/`;
  const params = {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  };
  const response = await fetch(url, params);
  return await response.json();
}
