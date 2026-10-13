import React from "react";
import { Icon } from "semantic-ui-react";
import { LoginForm } from "../../../components/Admin";
import logo from "../../../assets/images/logo_sena.png";
export function LoginAdmin() {
  return (
    <div className="access-page">
      <section className="access-story">
        <div className="access-brand">
          <img src={logo} alt="SENA" />
          <span>Actas · SENA</span>
        </div>
        <div>
          <span className="access-pill">UN ESPACIO PARA TRABAJAR MEJOR</span>
          <h1>
            Grandes ideas.
            <br />
            Acuerdos claros.
          </h1>
          <p>
            Organiza tus reuniones y transforma cada conversación en un registro
            que impulse a tu equipo.
          </p>
          <div className="access-features">
            <span>
              <Icon name="calendar alternate outline" />
              Reuniones organizadas
            </span>
            <span>
              <Icon name="file alternate outline" />
              Actas en un solo lugar
            </span>
            <span>
              <Icon name="check circle outline" />
              Compromisos documentados
            </span>
          </div>
        </div>
        <small>Servicio Nacional de Aprendizaje</small>
      </section>
      <section className="access-form">
        <div className="access-form-inner">
          <span className="eyebrow">BIENVENIDO A TU ESPACIO</span>
          <h2>Inicia sesión</h2>
          <p>Ingresa con tu cuenta para continuar.</p>
          <LoginForm />
          <div className="access-help">
            <Icon name="lock" />
            ¿Necesitas acceso? Contacta al administrador de tu centro.
          </div>
        </div>
        <small>Gestión de reuniones y actas · SENA</small>
      </section>
    </div>
  );
}
