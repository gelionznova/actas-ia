import React from "react";
import { Table, Button, Icon } from "semantic-ui-react";
import { map } from "lodash";
import "./TableUsers.scss";

export function TableUsers(props) {
  const { users, updateUser, onDeleteUser } = props;

  return (
    <Table className="table-users-admin">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Usuario</Table.HeaderCell>
          <Table.HeaderCell>Correo</Table.HeaderCell>
          <Table.HeaderCell>Nombre</Table.HeaderCell>
          <Table.HeaderCell>Apellidos</Table.HeaderCell>
          <Table.HeaderCell>Activo</Table.HeaderCell>
          <Table.HeaderCell>Administrador</Table.HeaderCell>
          <Table.HeaderCell>En línea</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {map(users, (user, index) => (
          <Table.Row key={index}>
            <Table.Cell>{user.username}</Table.Cell>
            <Table.Cell>{user.email}</Table.Cell>
            <Table.Cell>{user.first_name}</Table.Cell>
            <Table.Cell>{user.last_name}</Table.Cell>
            <Table.Cell className="status">
              {user.is_active ? <Icon name="check" /> : <Icon name="close" />}
            </Table.Cell>
            <Table.Cell className="status">
              {user.is_staff ? <Icon name="check" /> : <Icon name="close" />}
            </Table.Cell>
            <Table.Cell className="status">
              {" "}
              {/* Nueva columna */}
              {user.is_online ? (
                <Icon name="circle" color="green" />
              ) : (
                <Icon name="circle outline" />
              )}
            </Table.Cell>

            <Actions
              user={user}
              updateUser={updateUser}
              onDeleteUser={onDeleteUser}
            />
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function Actions(props) {
  const { user, updateUser, onDeleteUser } = props;

  return (
    <Table.Cell textAlign="right">
      <Button
        icon
        aria-label={`Editar ${user.username}`}
        onClick={() => updateUser(user)}
      >
        <Icon name="pencil" />
      </Button>
      <Button
        icon
        negative
        aria-label={`Eliminar ${user.username}`}
        onClick={() => onDeleteUser(user)}
      >
        <Icon name="close" />
      </Button>
    </Table.Cell>
  );
}
