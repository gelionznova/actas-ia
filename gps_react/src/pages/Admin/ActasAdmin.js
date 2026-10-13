import React, { useState } from "react";
import { Input, Message, Button, Icon } from "semantic-ui-react";
import { HeaderPage } from "../../components/Admin";
import { ActasTable } from "../../components/Admin/ActasTable";
import { useAuth } from "../../hooks/useAuth";
import { useActas } from "../../hooks/useActas";
import { generarActaApi } from "../../api/meetingSessionActa";
import { descargarActaDeSesion } from "../../api/actaWord";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
export function ActasAdmin() {
  const { auth } = useAuth();
  const { sessions, loading, error, reload } = useActas();
  const [loadingSessionId, setLoadingSessionId] = useState(null),
    [descargandoId, setDescargandoId] = useState(null),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const filtered = sessions.filter(
    (s) =>
      s.meeting_title.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" ||
        (filter === "generated"
          ? s.acta_status === "generated"
          : s.acta_status !== "generated")),
  );
  const generate = async (s) => {
    const rehacer = s.acta_status === "generated";
    if (
      !window.confirm(
        rehacer
          ? "Ya existe un acta para esta sesión. ¿Crear una nueva versión desde el audio? La transcripción puede tardar varios minutos."
          : "¿Generar el acta a partir del audio? La transcripción puede tardar varios minutos.",
      )
    )
      return;
    setLoadingSessionId(s.id);
    try {
      await generarActaApi(s.id, auth.token);
      toast.success("Acta generada. Revisa su contenido.");
      await reload();
    } catch (e) {
      toast.error(
        e.message ||
          "No se pudo transcribir el audio. Puedes redactar el acta desde el editor.",
      );
    } finally {
      setLoadingSessionId(null);
    }
  };
  const descargar = async (s) => {
    setDescargandoId(s.id);
    try {
      await descargarActaDeSesion(s, auth.token);
    } catch (e) {
      toast.error(e.message || "No se pudo descargar el acta.");
    } finally {
      setDescargandoId(null);
    }
  };
  return (
    <>
      <HeaderPage
        title="Actas"
        subtitle="Conserva los acuerdos y da seguimiento a cada sesión."
      />
      <div className="toolbar">
        <Input
          icon="search"
          aria-label="Buscar actas"
          placeholder="Buscar por reunión…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="ui dropdown"
          aria-label="Filtrar por estado"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="generated">Generadas</option>
          <option value="pending">Pendientes</option>
        </select>
        <span className="result-count">{filtered.length} sesiones</span>
      </div>
      {error ? (
        <Message negative role="alert">
          No se pudieron cargar las actas.
          <Button onClick={reload}>Reintentar</Button>
        </Message>
      ) : !loading && !filtered.length ? (
        <div className="surface-panel empty-state">
          <span className="empty-icon">
            <Icon name="file alternate outline" />
          </span>
          <h3>
            {sessions.length
              ? "No hay actas con estos filtros"
              : "Tus acuerdos tendrán un lugar aquí"}
          </h3>
          <p>
            Las sesiones de tus reuniones aparecen en esta sección para
            documentarlas.
          </p>
          <Button as={Link} to="/meetings">
            Ir a reuniones
          </Button>
        </div>
      ) : (
        <ActasTable
          sessions={filtered}
          loading={loading}
          loadingSessionId={loadingSessionId}
          onGenerateActa={generate}
          onDescargarWord={descargar}
          descargandoId={descargandoId}
        />
      )}
    </>
  );
}
