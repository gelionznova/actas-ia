integralo en ActaEditorPage.js y pasas el codigo complpeto actualizado

// src/pages/Admin/ActaEditorPage.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Loader, Header } from "semantic-ui-react";
import { useAuth } from "../../hooks/useAuth";
import { useActaVersions } from "../../hooks/useActaVersions";

export function ActaEditorPage() {
  const { sessionId } = useParams();
  console.log("sessionId de URL:", sessionId); // DEBE SER un número válido
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;
  const { versions, loading, save } = useActaVersions(sessionId, token);
  console.log("Acta versions:", versions);


  // Debug: Verifica qué acta estás editando
  useEffect(() => {
    console.log("sessionId (de URL params):", sessionId);
    console.log("Acta versions (del Hook):", versions);
  }, [sessionId, versions]);

  // Contenido inicial: versión más reciente, si existe
  const [content, setContent] = useState("");
  useEffect(() => {
    if (versions.length > 0) {
      setContent(versions[0].content_html);
    } else {
      setContent(""); // Sin acta previa
    }
  }, [versions]);

  const handleSave = async () => {
    try {
      await save(content);
      alert("Acta guardada con éxito.");
      navigate("/actas");
    } catch (err) {
      console.error("Error al guardar acta:", err);
      alert("Error al guardar el acta.");
    }
  };

  if (loading) {
    return (
      <Loader active inline="centered">
        Cargando acta...
      </Loader>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <Header as="h2">Editar Acta (Sesión {sessionId})</Header>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        style={{ height: 400, marginBottom: 20 }}
      />
      <Button primary onClick={handleSave}>
        Guardar Acta
      </Button>
      <Button onClick={() => navigate(-1)} style={{ marginLeft: 10 }}>
        Cancelar
      </Button>
    </div>
  );
}
