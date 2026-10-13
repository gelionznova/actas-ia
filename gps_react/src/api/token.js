import { TOKEN } from "../utils/constants";

const REFRESH = `${TOKEN}_refresh`;

export function setToken(token) {
  localStorage.setItem(TOKEN, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN);
}

export function removeToken() {
  localStorage.removeItem(TOKEN);
  localStorage.removeItem(REFRESH);
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem(REFRESH, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH);
}
