import React, { useState } from "react";
import { Form, Button, Message } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useUser } from "../../../../hooks";
export function AddEditUserForm({ onClose, onRefetch, user }) {
  const { addUser, updateUser } = useUser();
  const [error, setError] = useState("");
  const formik = useFormik({
    initialValues: {
      username: user?.username || "",
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      password: "",
      is_active: user?.is_active ?? true,
      is_staff: user?.is_staff ?? false,
    },
    validateOnChange: false,
    validationSchema: Yup.object({
      username: Yup.string().required("Ingresa un nombre de usuario."),
      email: Yup.string()
        .email("Ingresa un correo válido.")
        .required("Ingresa el correo."),
      password: user
        ? Yup.string()
        : Yup.string()
            .min(8, "Usa al menos 8 caracteres.")
            .required("Define una contraseña."),
    }),
    onSubmit: async (values) => {
      setError("");
      try {
        const data = { ...values };
        if (user && !data.password) delete data.password;
        if (user) await updateUser(user.id, data);
        else await addUser(data);
        toast.success("Usuario guardado.");
        onRefetch();
        onClose();
      } catch (e) {
        setError(e.message);
      }
    },
  });
  return (
    <Form onSubmit={formik.handleSubmit}>
      {[
        ["username", "Nombre de usuario"],
        ["email", "Correo electrónico"],
        ["first_name", "Nombre"],
        ["last_name", "Apellidos"],
        ["password", user ? "Nueva contraseña (opcional)" : "Contraseña"],
      ].map(([key, label]) => (
        <Form.Input
          key={key}
          id={`user-${key}`}
          label={label}
          name={key}
          type={
            key === "password" ? "password" : key === "email" ? "email" : "text"
          }
          autoComplete={key === "password" ? "new-password" : "off"}
          value={formik.values[key]}
          onChange={formik.handleChange}
          error={formik.errors[key]}
        />
      ))}
      <Form.Checkbox
        label="Cuenta activa"
        checked={formik.values.is_active}
        onChange={(_, d) => formik.setFieldValue("is_active", d.checked)}
      />
      <Form.Checkbox
        label="Permisos de administrador"
        checked={formik.values.is_staff}
        onChange={(_, d) => formik.setFieldValue("is_staff", d.checked)}
      />
      {error && (
        <Message negative role="alert">
          {error}
        </Message>
      )}
      <div className="form-actions">
        <Button type="button" onClick={onClose} disabled={formik.isSubmitting}>
          Cancelar
        </Button>
        <Button
          primary
          type="submit"
          disabled={formik.isSubmitting}
          loading={formik.isSubmitting}
        >
          Guardar usuario
        </Button>
      </div>
    </Form>
  );
}
