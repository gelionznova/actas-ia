import { BASE_API } from "../utils/constants";
import { getToken, setToken, getRefreshToken, removeToken } from "./token";

const ERROR_CONEXION =
  "No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.";

let refrescoEnCurso = null;

/**
 * Cambia el refresh token por un access token nuevo. Las llamadas simultaneas
 * comparten la misma peticion para no pedir varios refrescos a la vez.
 */
function refrescarToken() {
  if (refrescoEnCurso) return refrescoEnCurso;
  const refresh = getRefreshToken();
  if (!refresh) return Promise.resolve(null);

  refrescoEnCurso = fetch(`${BASE_API}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data?.access) {
        removeToken();
        return null;
      }
      setToken(data.access);
      return data.access;
    })
    .catch(() => null)
    .finally(() => {
      refrescoEnCurso = null;
    });

  return refrescoEnCurso;
}

/**
 * fetch con el token de sesion. Si la respuesta es 401 intenta refrescar el
 * token una vez y repite la peticion.
 */
export async function authFetch(url, token, opciones = {}) {
  const cabeceras = (valor) => ({
    ...opciones.headers,
    ...(valor ? { Authorization: `Bearer ${valor}` } : {}),
  });

  // token === null significa "sin autenticacion" (el login). En los demas casos
  // manda el token guardado, que es el mas reciente tras un refresco.
  const actual = token === null ? null : getToken() || token;

  let respuesta;
  try {
    respuesta = await fetch(url, { ...opciones, headers: cabeceras(actual) });
  } catch {
    throw new Error(ERROR_CONEXION);
  }

  if (actual === null) return respuesta;

  if (respuesta.status !== 401 || !getRefreshToken()) return respuesta;

  const nuevo = await refrescarToken();
  if (!nuevo) return respuesta;
  try {
    return await fetch(url, { ...opciones, headers: cabeceras(nuevo) });
  } catch {
    throw new Error(ERROR_CONEXION);
  }
}

export async function request(path, token, { method = "GET", data } = {}) {
  const multipart = data instanceof FormData;
  const response = await authFetch(`${BASE_API}/api/${path}`, token, {
    method,
    headers: !multipart && data ? { "Content-Type": "application/json" } : {},
    body: data ? (multipart ? data : JSON.stringify(data)) : undefined,
  });

  if (response.status === 204) return null;
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      result?.detail ||
      result?.error ||
      (result &&
        Object.entries(result)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(" ") : value}`,
          )
          .join(" "));
    throw new Error(detail || "No se pudo completar la solicitud.");
  }
  return result;
}
