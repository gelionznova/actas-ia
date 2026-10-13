import React, { useState } from "react";
import { Button, Form, Message } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginApi } from "../../../api/user";
import { useAuth } from "../../../hooks";
export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validateOnChange: false,
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Ingresa un correo válido.")
        .required("Ingresa tu correo."),
      password: Yup.string().required("Ingresa tu contraseña."),
    }),
    onSubmit: async (values) => {
      setError("");
      try {
        await login(await loginApi(values));
      } catch (e) {
        setError(e.message);
      }
    },
  });
  return (
    <Form onSubmit={formik.handleSubmit} className="access-fields">
      <Form.Input
        id="login-email"
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="nombre@correo.com"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.errors.email}
      />
      <Form.Input
        id="login-password"
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Ingresa tu contraseña"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.errors.password}
      />
      {error && (
        <Message negative role="alert">
          {error}
        </Message>
      )}
      <Button
        fluid
        primary
        type="submit"
        loading={formik.isSubmitting}
        disabled={formik.isSubmitting}
      >
        Iniciar sesión
      </Button>
    </Form>
  );
}
