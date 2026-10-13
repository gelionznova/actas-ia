import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader, Input, Message, Button, Icon } from "semantic-ui-react";
import { toast } from "react-toastify";
import {
  HeaderPage,
  AddMeetingForm,
  MeetingTable,
} from "../../components/Admin";
import { ModalBasic } from "../../components/Common/ModalBasic";
import { useAuth } from "../../hooks";
import { useMeeting } from "../../hooks/useMeeting";
export function MeetingsAdmin() {
  const { auth } = useAuth();
  const { meetings, loading, error, getMeetings, deleteMeeting } = useMeeting();
  const [params, setParams] = useSearchParams();
  const [modal, setModal] = useState(null),
    [query, setQuery] = useState("");
  const reload = () => getMeetings(auth.token);
  useEffect(() => {
    getMeetings(auth.token);
  }, [auth.token, getMeetings]);
  useEffect(() => {
    if (params.get("new") === "1") {
      setModal({});
      setParams({}, { replace: true });
    }
  }, [params, setParams]);
  const filtered = meetings.filter((m) =>
    `${m.title} ${m.description || ""}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  const remove = async (m) => {
    if (
      !window.confirm(
        `¿Eliminar «${m.title}» y todas sus sesiones y actas? Esta acción no se puede deshacer.`,
      )
    )
      return;
    try {
      await deleteMeeting(m.id, auth.token);
      toast.success("Reunión eliminada.");
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <>
      <HeaderPage
        title="Reuniones"
        subtitle="Organiza las conversaciones, grabaciones y acuerdos de tu equipo."
        btnTitle="Nueva reunión"
        btnClick={() => setModal({})}
      />
      <div className="toolbar">
        <Input
          icon="search"
          placeholder="Buscar reuniones…"
          aria-label="Buscar reuniones"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="result-count">
          {filtered.length} de {meetings.length} reuniones
        </span>
      </div>
      {error ? (
        <Message negative role="alert">
          {error}
          <Button onClick={reload}>Reintentar</Button>
        </Message>
      ) : loading ? (
        <Loader active inline="centered">
          Cargando reuniones…
        </Loader>
      ) : filtered.length ? (
        <MeetingTable
          meetings={filtered}
          updateMeeting={setModal}
          deleteMeeting={remove}
          onRefetch={reload}
        />
      ) : (
        <div className="surface-panel empty-state">
          <span className="empty-icon">
            <Icon name="calendar alternate outline" />
          </span>
          <h3>
            {query
              ? "No encontramos coincidencias"
              : "Todavía no tienes reuniones"}
          </h3>
          <p>
            {query
              ? "Prueba con otro título o descripción."
              : "Crea tu primera reunión y empieza a documentar los acuerdos."}
          </p>
          <Button primary onClick={() => (query ? setQuery("") : setModal({}))}>
            {query ? "Limpiar búsqueda" : "Crear reunión"}
          </Button>
        </div>
      )}
      <ModalBasic
        show={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.id ? "Editar reunión" : "Nueva reunión"}
      >
        {modal !== null && (
          <AddMeetingForm
            key={modal.id || "new"}
            meeting={modal.id ? modal : undefined}
            onClose={() => setModal(null)}
            onRefetch={reload}
          />
        )}
      </ModalBasic>
    </>
  );
}
