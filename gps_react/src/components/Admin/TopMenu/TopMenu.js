import React from "react";
import { Icon } from "semantic-ui-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../hooks";
export function TopMenu({ onMenu }) {
  const { auth, logout } = useAuth();
  const { pathname } = useLocation();
  const title =
    {
      "/admin": "Resumen",
      "/meetings": "Reuniones",
      "/actas": "Actas",
      "/users": "Usuarios",
      "/settings": "Mi cuenta",
      "/supports": "Centro de ayuda",
    }[pathname] || "Editor de acta";
  const name = auth.me?.first_name || auth.me?.username || "Usuario";
  return (
    <header className="workspace-topbar">
      <div className="topbar-location">
        <button
          className="icon-button mobile-menu"
          onClick={onMenu}
          aria-label="Abrir navegación"
        >
          <Icon name="bars" />
        </button>
        <span>Espacio de trabajo</span>
        <Icon name="angle right" />
        <strong>{title}</strong>
      </div>
      <div className="topbar-account">
        <Link to="/settings" className="account-link">
          <span className="account-avatar">
            {name.slice(0, 2).toUpperCase()}
          </span>
          <span>
            {name}
            <small>{auth.me?.is_staff ? "Administrador" : "Colaborador"}</small>
          </span>
        </Link>
        <button
          className="icon-button"
          onClick={logout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <Icon name="sign-out" />
        </button>
      </div>
    </header>
  );
}
