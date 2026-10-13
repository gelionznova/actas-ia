// src/components/Admin/SideMenu/SideMenu.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Menu, Icon, Image, Popup, Label } from "semantic-ui-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks";
import SenaLogo from "../../../assets/images/sena-1.png";
import "./SideMenu.scss";

const MOBILE_MAX = 768;
const STORAGE_KEY = "sidemenu:collapsed";

export function SideMenu(props) {
  const { children } = props;
  const { pathname } = useLocation();

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_MAX
  );
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved === "true";
    return window.innerWidth <= MOBILE_MAX ? true : initial;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_MAX;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed, isMobile]);

  useEffect(() => {
    document.body.style.overflow = isMobile && !collapsed ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isMobile, collapsed]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isMobile && !collapsed) setCollapsed(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile, collapsed]);

  return (
    <div
      className={`side-menu-admin ${collapsed ? "collapsed" : ""} ${
        isMobile ? "mobile" : "desktop"
      }`}
    >
      {isMobile && !collapsed && (
        <button
          aria-label="Cerrar menú"
          className="side-menu-backdrop"
          onClick={() => setCollapsed(true)}
        />
      )}
      <MenuLeft
        pathname={pathname}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
      />
      <div className="content">{children}</div>
    </div>
  );
}

function MenuLeft({ pathname, collapsed, setCollapsed, isMobile }) {
  const { auth } = useAuth();
  const userMenuRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const onDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const getInitials = () => {
    const firstName = auth?.me?.first_name || "";
    const lastName = auth?.me?.last_name || "";
    if (firstName || lastName)
      return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
    return auth?.me?.email ? auth.me.email[0].toUpperCase() : "U";
  };

  const getFullName = () =>
    `${auth?.me?.first_name || ""} ${auth?.me?.last_name || ""}`.trim() ||
    auth?.me?.email ||
    "Usuario";

  // ← Rutas actualizadas con /app
  const menuItems = useMemo(
    () => [
      { key: "home", to: "/app", icon: "home", label: "Inicio", color: "blue" },
      {
        key: "meetings",
        to: "/app/meetings",
        icon: "calendar alternate outline",
        label: "Reuniones",
        color: "green",
      },
      {
        key: "actas",
        to: "/app/actas",
        icon: "file alternate outline",
        label: "Actas",
        color: "purple",
      },
    ],
    []
  );

  const bottomMenuItems = useMemo(
    () => [
      ...(auth?.me?.is_staff
        ? [
            {
              key: "users",
              to: "/app/users",
              icon: "users",
              label: "Usuarios",
              color: "orange",
            },
          ]
        : []),
      {
        key: "supports",
        to: "/app/supports",
        icon: "life ring outline",
        label: "Soporte",
        color: "teal",
      },
    ],
    [auth?.me?.is_staff]
  );

  const isActivePath = (to) => {
    if (to === "/app") {
      // Home sólo activo en la raíz del panel
      return pathname === "/app" || pathname === "/app/";
    }
    // El resto activo si coincide exacto o es prefijo
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const MenuItem = ({ item }) => {
    const isActive = isActivePath(item.to);
    const content = (
      <Menu.Item
        as={item.action ? "div" : Link}
        to={item.to}
        active={isActive}
        className={`menu-item ${isActive ? "active" : ""}`}
        onClick={(e) => {
          if (item.action) item.action(e);
          if (isMobile) setCollapsed(true);
        }}
        aria-current={isActive ? "page" : undefined}
        title={collapsed ? item.label : undefined}
      >
        <div className="menu-item-content">
          <Icon name={item.icon} className={`menu-icon ${item.color}`} />
          {!collapsed && <span className="menu-label">{item.label}</span>}
          {isActive && <div className="active-indicator" />}
        </div>
      </Menu.Item>
    );
    return collapsed ? (
      <Popup
        trigger={content}
        content={item.label}
        position="right center"
        size="mini"
        inverted
      />
    ) : (
      content
    );
  };

  return (
    <nav
      className={`side ${collapsed ? "collapsed" : ""}`}
      aria-label="Barra lateral de navegación"
    >
      <div className="toggle-button">
        <button
          className="toggle-icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          aria-expanded={!collapsed}
        >
          <Icon name={collapsed ? "angle right" : "angle left"} />
        </button>
      </div>

      <div className="user-section" ref={userMenuRef}>
        <button
          className="user-avatar-wrapper"
          onClick={() => setShowUserMenu((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={showUserMenu}
          title="Cuenta"
        >
          {auth?.me?.avatar_url ? (
            <Image
              src={auth.me.avatar_url}
              alt="Avatar de usuario"
              circular
              className="user-avatar-image"
            />
          ) : (
            <div className="user-avatar-initials" aria-hidden="true">
              <span>{getInitials()}</span>
            </div>
          )}
          <span className="sr-only">Abrir menú de usuario</span>
          <div className="online-status" />
        </button>

        {/* … (resto igual) … */}
      </div>

      <div className="menu-divider" />

      <div className="menu-section main-menu">
        <Menu borderless vertical fluid>
          {menuItems.map((item) => (
            <MenuItem key={item.key} item={item} />
          ))}
        </Menu>
      </div>

      <div className="flex-spacer" />

      <div className="menu-section bottom-menu">
        <div className="menu-divider" />
        <Menu borderless vertical fluid>
          {bottomMenuItems.map((item) => (
            <MenuItem key={item.key} item={item} />
          ))}
        </Menu>
      </div>

      <div
        className={`sidebar-footer ${collapsed ? "compact" : ""}`}
        aria-label="Información de versión"
      >
        <div className="app-version">
          <img
            src={SenaLogo}
            alt="Logo SENA"
            className="app-logo"
            loading="lazy"
          />
          {!collapsed && <small>Actas Inteligentes v1.0.0</small>}
        </div>
      </div>
    </nav>
  );
}
