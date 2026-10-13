import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon, Message, Button } from "semantic-ui-react";
import { HeaderPage } from "../../components/Admin";
import { useAuth } from "../../hooks/useAuth";
import { useMeeting } from "../../hooks/useMeeting";
export function HomesAdmin() {
  const { auth } = useAuth();
  const { meetings, loading, error, getMeetings } = useMeeting();
  useEffect(() => {
    getMeetings(auth.token);
  }, [auth.token, getMeetings]);
  const sessions = meetings.flatMap((m) => m.sessions || []);
  const completed = sessions.filter(
    (s) => s.acta_status === "generated",
  ).length;
  const recent = [...meetings]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);
  const today = new Date().toLocaleDateString("es-CO");
  const scheduled = meetings.flatMap((m) =>
    (m.sessions || [])
      .filter(
        (s) => new Date(s.start_datetime).toLocaleDateString("es-CO") === today,
      )
      .map((s) => ({ ...s, title: m.title })),
  );
  return (
    <>
      <HeaderPage
        title={`Hola, ${auth.me?.first_name || "bienvenido"}`}
        subtitle="Todo lo que necesitas para dar seguimiento a tus reuniones."
      />
      <section className="dashboard-hero">
        <div>
          <span className="hero-label">CADA REUNIÓN CUENTA</span>
          <h2>
            Convierte las ideas
            <br />
            en próximos pasos.
          </h2>
          <p>
            Reúne a tu equipo, documenta los acuerdos
            <br />y conserva lo importante en un solo lugar.
          </p>
          <Button as={Link} to="/meetings?new=1" primary>
            <Icon name="plus" />
            Nueva reunión
          </Button>
          <Link className="hero-secondary" to="/actas">
            Ver mis actas <Icon name="arrow right" />
          </Link>
        </div>
        <div className="hero-document" aria-hidden="true">
          <div className="document-heading">
            <Icon name="file alternate outline" />
            <span>ACTA DE REUNIÓN</span>
          </div>
          <div className="document-line long" />
          <div className="document-line" />
          <div className="document-line short" />
          <div className="document-check">
            <Icon name="check circle" />
            Acuerdos que nos hacen avanzar
          </div>
          <div className="document-line" />
          <div className="document-line short" />
        </div>
      </section>
      {error && (
        <Message negative role="alert">
          {error}
          <Button onClick={() => getMeetings(auth.token)}>Reintentar</Button>
        </Message>
      )}
      <section className="stats-grid" aria-label="Resumen de actividad">
        {[
          [
            "calendar alternate outline",
            "Reuniones",
            meetings.length,
            "En tu espacio de trabajo",
          ],
          [
            "microphone",
            "Grabaciones",
            sessions.filter((s) => s.audio_file).length,
            "Sesiones con audio",
          ],
          [
            "file alternate outline",
            "Actas generadas",
            completed,
            "Documentos disponibles",
          ],
          [
            "clock outline",
            "Por documentar",
            sessions.length - completed,
            "Sesiones sin acta generada",
          ],
        ].map(([icon, label, value, description]) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <Icon name={icon} />
            </div>
            <strong>{loading ? "—" : value}</strong>
            <small>{description}</small>
          </div>
        ))}
      </section>
      <section className="dashboard-columns">
        <div className="surface-panel">
          <div className="section-heading">
            <h2>Reuniones recientes</h2>
            <Link to="/meetings">
              Ver todas <Icon name="arrow right" />
            </Link>
          </div>
          {loading ? (
            <p className="panel-message" role="status">
              Cargando reuniones…
            </p>
          ) : recent.length ? (
            recent.map((m) => (
              <Link className="recent-row" to="/meetings" key={m.id}>
                <span className="row-icon">
                  <Icon name="calendar alternate outline" />
                </span>
                <span>
                  <strong>{m.title}</strong>
                  <small>
                    {m.sessions.length} sesiones ·{" "}
                    {new Date(m.created_at).toLocaleDateString("es-CO")}
                  </small>
                </span>
                <Icon name="angle right" />
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name="calendar alternate outline" />
              </span>
              <h3>Tu próxima reunión empieza aquí</h3>
              <p>Crea una reunión para organizar sus sesiones y acuerdos.</p>
              <Link to="/meetings?new=1">
                Crear mi primera reunión <Icon name="arrow right" />
              </Link>
            </div>
          )}
        </div>
        <div className="surface-panel">
          <div className="section-heading">
            <h2>Tu agenda de hoy</h2>
            <span className="soft-badge">{today}</span>
          </div>
          {scheduled.length ? (
            scheduled.map((s) => (
              <div className="agenda-row" key={s.id}>
                <strong>
                  {new Date(s.start_datetime).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
                <span>{s.title}</span>
              </div>
            ))
          ) : (
            <div className="empty-state compact">
              <Icon name="calendar check outline" size="big" />
              <h3>Un espacio para planear</h3>
              <p>No tienes sesiones registradas para hoy.</p>
            </div>
          )}
          <div className="tip-note">
            <Icon name="lightbulb outline" />
            <p>
              <strong>Un buen hábito</strong>Revisa los compromisos y sus
              responsables antes de finalizar cada acta.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
