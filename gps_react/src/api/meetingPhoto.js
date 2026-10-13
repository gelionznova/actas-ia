import { request } from "./request";
export const getMeetingPhotosApi = (id, token) =>
  request(`meeting-photos/?meeting=${id}`, token);
export const addMeetingPhotoApi = (data, token) =>
  request("meeting-photos/", token, { method: "POST", data });
export const deletePhotoApi = (id, token) =>
  request(`meeting-photos/${id}/`, token, { method: "DELETE" });
