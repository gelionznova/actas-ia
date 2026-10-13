import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "semantic-ui-react";
import { HeaderPage } from "../../components/Admin";
export function SuportsAdmin() {
  return (
    <>
      <HeaderPage
        title="Centro de ayuda"
        subtitle="Una guía práctica para aprovechar tu espacio de trabajo."
      />
      <div className="help-steps">
        {[
          [
            "01",
            "calendar alternate outline",
            "Organiza tu reunión",
            "Crea una reunión con un título claro y una descripción de su propósito.",
            "/meetings",
          ],
          [
            "02",
            "microphone",
            "Registra la conversación",
            "Abre la reunión e inicia una sesión. Permite el acceso al micrófono cuando el navegador lo solicite.",
            "/meetings",
          ],
          [
            "03",
            "file alternate outline",
            "Documenta los acuerdos",
            "Desde Actas, abre el editor de una sesión, revisa el contenido y guarda los compromisos.",
            "/actas",
          ],
        ].map(([n, icon, title, text, to]) => (
          <Link className="surface-panel padded help-step" to={to} key={n}>
            <span className="step-number">{n}</span>
            <Icon name={icon} size="big" />
            <h2>{title}</h2>
            <p>{text}</p>
            <span>
              Ir al módulo <Icon name="arrow right" />
            </span>
          </Link>
        ))}
      </div>
      <section className="surface-panel padded faq">
        <h2>Preguntas frecuentes</h2>
        {[
          [
            "¿Cómo obtengo una cuenta?",
            "El administrador de tu centro crea las cuentas y asigna los permisos. Si no puedes ingresar, solicita que revise tu correo y el estado de tu cuenta.",
          ],
          [
            "¿Por qué no puedo grabar?",
            "Revisa que el micrófono esté conectado y que el navegador tenga permiso para usarlo. La grabación requiere una conexión HTTPS o acceso desde localhost.",
          ],
          [
            "¿Puedo editar un acta sin transcribir audio?",
            "Sí. Abre el editor de la sesión desde Actas para redactar manualmente la agenda, el desarrollo y los compromisos.",
          ],
          [
            "¿Cómo funciona la transcripción?",
            "La generación automática requiere que el servicio de transcripción esté instalado y disponible. Si falla, puedes continuar con la edición manual. Revisa siempre el resultado.",
          ],
          [
            "¿Cómo imprimo el acta?",
            "Abre el editor y selecciona Imprimir acta. En el diálogo del navegador puedes elegir una impresora o guardar el documento como PDF.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </>
  );
}
