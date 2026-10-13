import React, { useState } from "react";
import { LoginAdmin } from "../../pages/Admin";
import { SideMenu, TopMenu } from "../../components/Admin";
import { useAuth } from "../../hooks";
export function AdminLayout({ children }) {
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  if (!auth) return <LoginAdmin />;
  return (
    <div className="workspace">
      <a className="skip-link" href="#main-content">
        Ir al contenido
      </a>
      <SideMenu open={open} onClose={() => setOpen(false)} />
      <div className="workspace-main">
        <TopMenu onMenu={() => setOpen((v) => !v)} />
        <main id="main-content" className="workspace-content">
          {children}
        </main>
        <footer className="workspace-footer">
          SENA · Gestión de reuniones y actas
          <span>Organiza. Documenta. Avanza.</span>
        </footer>
      </div>
    </div>
  );
}
