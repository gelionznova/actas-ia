import { request } from "./request";
export const loginApi = (data) =>
  request("auth/login/", null, { method: "POST", data });
export const getMeApi = (token) => request("auth/me/", token);
export const getUsersApi = (token) => request("users/", token);
export const addUserApi = (data, token) =>
  request("users/", token, { method: "POST", data });
export const updateUserApi = (id, data, token) =>
  request(`users/${id}/`, token, { method: "PATCH", data });
export const deleteUserApi = (id, token) =>
  request(`users/${id}/`, token, { method: "DELETE" });
export const getUserStatusApi = (id, token) =>
  request(`users/status/${id}/`, token);
