import React from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "semantic-ui-react";
import { useAuth } from "../../../hooks";
import logo from "../../../assets/images/logo_sena.png";
export function SideMenu({ open, onClose }) {
  const { auth } = useAuth();
  const item = (to, icon, label) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) => `workspace-link ${isActive ? "active" : ""}`}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </NavLink>
  );
  return (
    <>
      <button
        className={`nav-scrim ${open ? "visible" : ""}`}
        aria-label="Cerrar navegación"
        onClick={onClose}
      />
      <aside
        className={`workspace-sidebar side-menu-admin ${open ? "open" : ""}`}
      >
        <NavLink to="/admin" className="workspace-brand" onClick={onClose}>
          <img src={logo} alt="SENA" />
          <span>
            Actas<span className="brand-caption">ESPACIO DE TRABAJO</span>
          </span>
        </NavLink>
        <nav aria-label="Navegación principal">
          <p className="nav-label">PRINCIPAL</p>
          {item("/admin", "grid layout", "Resumen")}
          {item("/meetings", "calendar alternate outline", "Reuniones")}
          {item("/actas", "file alternate outline", "Actas")}
          <p className="nav-label nav-label-secondary">ADMINISTRACIÓN</p>
          {auth?.me?.is_staff && item("/users", "users", "Usuarios")}
          {item("/settings", "setting", "Mi cuenta")}
          {item("/supports", "question circle outline", "Centro de ayuda")}
        </nav>
        <div className="sidebar-note">
          <Icon name="leaf" />
          <strong>De la conversación a la acción.</strong>
          <p>Reuniones organizadas, acuerdos claros.</p>
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" />
          Gestión de reuniones SENA
        </div>
      </aside>
    </>
  );
}
