import React, { useState, useEffect, createContext } from "react";
import {
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
} from "../api/token";
import { getMeApi } from "../api/user";
export const AuthContext = createContext({
  auth: undefined,
  login: () => null,
  logout: () => null,
});
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(undefined);
  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      setAuth(null);
      return;
    }
    getMeApi(token)
      .then((me) => {
        if (active) setAuth({ token, me });
      })
      .catch(() => {
        if (active) {
          removeToken();
          setAuth(null);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const login = async ({ access, refresh }) => {
    const me = await getMeApi(access);
    setToken(access);
    setRefreshToken(refresh);
    setAuth({ token: access, me });
  };
  const logout = () => {
    removeToken();
    setAuth(null);
  };
  if (auth === undefined)
    return (
      <div className="app-loading" role="status">
        Cargando tu espacio de trabajo…
      </div>
    );
  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
