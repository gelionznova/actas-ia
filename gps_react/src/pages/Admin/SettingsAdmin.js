import React from "react";
import { HeaderPage } from "../../components/Admin";
import { useAuth } from "../../hooks";
import { Icon, Button } from "semantic-ui-react";
export function SettingsAdmin() {
  const { auth, logout } = useAuth();
  const me = auth.me;
  return (
    <>
      <HeaderPage
        title="Mi cuenta"
        subtitle="Consulta tu información y administra tu sesión."
      />
      <div className="settings-grid">
        <section className="surface-panel padded">
          <span className="profile-avatar">
            <Icon name="user outline" />
          </span>
          <h2>
            {[me.first_name, me.last_name].filter(Boolean).join(" ") ||
              me.username}
          </h2>
          <p className="muted">{me.email}</p>
          <span className="soft-badge">
            {me.is_staff ? "Administrador" : "Colaborador"}
          </span>
          <dl className="profile-details">
            <dt>Nombre de usuario</dt>
            <dd>{me.username}</dd>
            <dt>Estado de la cuenta</dt>
            <dd>{me.is_active ? "Activa" : "Inactiva"}</dd>
            <dt>Correo electrónico</dt>
            <dd>{me.email}</dd>
          </dl>
          <p className="help-copy">
            Para cambiar tus datos o restablecer tu contraseña, contacta al
            administrador de tu centro.
          </p>
        </section>
        <section className="surface-panel padded">
          <h2>Tu sesión</h2>
          <p>
            Cuando termines, cierra tu sesión si compartes este equipo con otras
            personas.
          </p>
          <Button onClick={logout}>
            <Icon name="sign-out" />
            Cerrar sesión
          </Button>
          <hr />
          <h3>Tu espacio de trabajo</h3>
          <p>
            Las reuniones y actas se organizan por cuenta. Desde el menú puedes
            consultar tus documentos y registrar nuevas sesiones.
          </p>
        </section>
      </div>
    </>
  );
}
