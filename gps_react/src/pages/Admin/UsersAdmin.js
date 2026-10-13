import React, { useState, useEffect } from "react";
import { Loader, Input, Message, Button } from "semantic-ui-react";
import { toast } from "react-toastify";
import {
  HeaderPage,
  TableUsers,
  AddEditUserForm,
} from "../../components/Admin";
import { ModalBasic } from "../../components/Common";
import { useUser, useAuth } from "../../hooks";
export function UsersAdmin() {
  const { auth } = useAuth();
  const { loading, error, users, getUsers, deleteUser } = useUser();
  const [modal, setModal] = useState(null),
    [query, setQuery] = useState("");
  useEffect(() => {
    if (auth.me?.is_staff) getUsers();
  }, [auth.me?.is_staff, getUsers]);
  if (!auth.me?.is_staff)
    return (
      <Message>
        La administración de usuarios está disponible para administradores.
      </Message>
    );
  const remove = async (user) => {
    if (user.id === auth.me.id) {
      toast.error("No puedes eliminar tu propia cuenta desde esta pantalla.");
      return;
    }
    if (!window.confirm(`¿Eliminar la cuenta ${user.email}?`)) return;
    try {
      await deleteUser(user.id);
      toast.success("Usuario eliminado.");
      getUsers();
    } catch (e) {
      toast.error(e.message);
    }
  };
  const filtered = users.filter((u) =>
    `${u.username} ${u.email} ${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <HeaderPage
        title="Usuarios"
        subtitle="Administra el acceso y los permisos de tu equipo."
        btnTitle="Nuevo usuario"
        btnClick={() => setModal({})}
      />
      <div className="toolbar">
        <Input
          icon="search"
          aria-label="Buscar usuarios"
          placeholder="Buscar por nombre o correo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="result-count">{filtered.length} usuarios</span>
      </div>
      {error ? (
        <Message negative role="alert">
          {error}
          <Button onClick={getUsers}>Reintentar</Button>
        </Message>
      ) : loading ? (
        <Loader active inline="centered">
          Cargando usuarios…
        </Loader>
      ) : (
        <div className="table-scroll">
          <TableUsers
            users={filtered}
            updateUser={setModal}
            onDeleteUser={remove}
          />
          {!filtered.length && (
            <div className="empty-state">
              No se encontraron usuarios con esa búsqueda.
            </div>
          )}
        </div>
      )}
      <ModalBasic
        show={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.id ? "Actualizar usuario" : "Nuevo usuario"}
      >
        {modal !== null && (
          <AddEditUserForm
            key={modal.id || "new"}
            user={modal.id ? modal : undefined}
            onClose={() => setModal(null)}
            onRefetch={getUsers}
          />
        )}
      </ModalBasic>
    </>
  );
}
