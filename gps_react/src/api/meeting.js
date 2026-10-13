import { request } from "./request";
export const getMeetingsApi = (token) => request("meetings/", token);
export const addMeetingApi = (data, token) =>
  request("meetings/", token, { method: "POST", data });
export const updateMeetingApi = (id, data, token) =>
  request(`meetings/${id}/`, token, { method: "PATCH", data });
export const deleteMeetingApi = (id, token) =>
  request(`meetings/${id}/`, token, { method: "DELETE" });
