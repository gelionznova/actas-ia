import React, { useRef } from "react";
import "./ActaTemplateEditor.scss";

export function ActaTemplateEditor({
  acta = {},
  compromisos = [],
  asistentes = [],
  onFieldChange = () => {},
  onChangeCompromisos = () => {},
  onChangeAsistentes = () => {},
  editable = true,
}) {
  const desarrolloRef = useRef();
  const conclusionesRef = useRef();

  // Helpers para edición de filas
  const handleCompromisoCell = (rowIdx, field, value) => {
    const newRows = compromisos.map((row, idx) =>
      idx === rowIdx ? { ...row, [field]: value } : row
    );
    onChangeCompromisos(newRows);
  };
  const handleAsistenteCell = (rowIdx, field, value) => {
    const newRows = asistentes.map((row, idx) =>
      idx === rowIdx ? { ...row, [field]: value } : row
    );
    onChangeAsistentes(newRows);
  };

  // Agregar/Eliminar filas
  const addCompromiso = () =>
    onChangeCompromisos([
      ...compromisos,
      { actividad: "", fecha: "", responsable: "", firma: "" },
    ]);
  const removeCompromiso = (idx) =>
    onChangeCompromisos(compromisos.filter((_, i) => i !== idx));
  const addAsistente = () =>
    onChangeAsistentes([
      ...asistentes,
      { nombre: "", dependencia: "", aprueba: "", observacion: "", firma: "" },
    ]);
  const removeAsistente = (idx) =>
    onChangeAsistentes(asistentes.filter((_, i) => i !== idx));

  // Edición de campos ricos
  const handleFieldBlur = (field, ref) => {
    if (onFieldChange) onFieldChange(field, ref.current.innerHTML);
  };

  return (
    <div className="acta-template">
      {/* ENCABEZADO */}
      <img
        src={acta.logoUrl || "/logo_sena.png"}
        alt="Logo SENA"
        className="acta-logo"
      />
      <table className="acta-table">
        <tbody>
          {/* ACTA No. */}
          <tr>
            <td colSpan={6} className="acta-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                ACTA No.&nbsp;
                <span title="Se numera automáticamente con la versión del acta">
                  {acta.numero || "01"}
                </span>
              </div>
            </td>
          </tr>

          {/* Nombre comité/reunión */}
          <tr>
            <td colSpan={6} style={{ fontWeight: "bold" }}>
              NOMBRE DEL COMITÉ O DE LA REUNIÓN:
              <span
                style={{ fontWeight: "normal", marginLeft: 5 }}
                title="Corresponde al título de la reunión; se cambia desde Reuniones"
              >
                {acta.comite || acta.meeting_title || acta.title || ""}
              </span>
            </td>
          </tr>
          {/* Ciudad, Fecha, Hora Inicio/Fin */}
          <tr>
            <td style={{ fontWeight: "bold" }}>CIUDAD Y FECHA:</td>
            <td>
              {editable ? (
                <>
                  <input
                    style={{ width: "45%", minWidth: 60 }}
                    value={acta.ciudad || ""}
                    placeholder="Ciudad"
                    aria-label="Ciudad"
                    onChange={(e) => onFieldChange("ciudad", e.target.value)}
                  />{" "}
                  <span title="Fecha de la sesión">{acta.fecha || ""}</span>
                </>
              ) : (
                <>
                  {acta.ciudad || ""} {acta.fecha || ""}
                </>
              )}
            </td>
            <td style={{ fontWeight: "bold" }}>
              HORA INICIO:
              <br />
              <span style={{ fontWeight: "normal" }}>
                <span title="Hora de inicio de la sesión">{acta.hora_inicio || ""}</span>
              </span>
            </td>
            <td style={{ fontWeight: "bold" }}>
              HORA FIN:
              <br />
              <span style={{ fontWeight: "normal" }}>
                <span title="Hora de fin de la sesión">{acta.hora_fin || ""}</span>
              </span>
            </td>
          </tr>
          {/* Lugar/enlace/centro */}
          <tr>
            <td style={{ fontWeight: "bold" }}>
              LUGAR Y/O ENLACE:
              <br />
              <span style={{ fontWeight: "normal" }}>
                {editable ? (
                  <input
                    style={{ width: "95%" }}
                    value={acta.lugar || ""}
                    onChange={(e) => onFieldChange("lugar", e.target.value)}
                  />
                ) : (
                  acta.lugar || ""
                )}
              </span>
            </td>
            <td colSpan={1} style={{ fontWeight: "normal" }}>
              {editable ? (
                <input
                  style={{ width: "95%" }}
                  value={acta.enlace || ""}
                  onChange={(e) => onFieldChange("enlace", e.target.value)}
                />
              ) : (
                acta.enlace || ""
              )}
            </td>
            <td colSpan={2} style={{ fontWeight: "bold" }}>
              DIRECCIÓN / REGIONAL / CENTRO:
              <br />
              <span style={{ fontWeight: "normal" }}>
                {editable ? (
                  <input
                    style={{ width: "95%" }}
                    value={acta.centro || ""}
                    onChange={(e) => onFieldChange("centro", e.target.value)}
                  />
                ) : (
                  acta.centro || ""
                )}
              </span>
            </td>
          </tr>
          {/* Agenda */}
          <tr>
            <td colSpan={6}>
              <b>AGENDA O PUNTOS PARA DESARROLLAR:</b>
              <br />
              {editable ? (
                <ol>
                  {(acta.agenda || []).map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 3 }}>
                      <input
                        style={{ width: "80%" }}
                        value={item}
                        onChange={(e) => {
                          const newAgenda = [...acta.agenda];
                          newAgenda[idx] = e.target.value;
                          onFieldChange("agenda", newAgenda);
                        }}
                      />
                      <button
                        type="button"
                        className="no-print agenda-btn"
                        onClick={() => {
                          const newAgenda = [...acta.agenda];
                          newAgenda.splice(idx, 1);
                          onFieldChange("agenda", newAgenda);
                        }}
                        style={{ marginLeft: 5, color: "red" }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      className="no-print"
                      onClick={() =>
                        onFieldChange("agenda", [...(acta.agenda || []), ""])
                      }
                    >
                      + Agregar punto
                    </button>
                  </li>
                </ol>
              ) : acta.agenda && acta.agenda.length > 0 ? (
                <ol>
                  {acta.agenda.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ol>
              ) : (
                <span>&nbsp;</span>
              )}
            </td>
          </tr>
          {/* Objetivos */}
          <tr>
            <td colSpan={6}>
              <b>OBJETIVO(S) DE LA REUNIÓN:</b>
              <br />
              {editable ? (
                <ul>
                  {(acta.objetivos || []).map((obj, idx) => (
                    <li key={idx} style={{ marginBottom: 3 }}>
                      <input
                        style={{ width: "80%" }}
                        value={obj}
                        onChange={(e) => {
                          const newObjs = [...acta.objetivos];
                          newObjs[idx] = e.target.value;
                          onFieldChange("objetivos", newObjs);
                        }}
                      />
                      <button
                        type="button"
                        className="no-print"
                        onClick={() => {
                          const newObjs = [...acta.objetivos];
                          newObjs.splice(idx, 1);
                          onFieldChange("objetivos", newObjs);
                        }}
                        style={{ marginLeft: 5, color: "red" }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      className="no-print"
                      onClick={() =>
                        onFieldChange("objetivos", [
                          ...(acta.objetivos || []),
                          "",
                        ])
                      }
                    >
                      + Agregar objetivo
                    </button>
                  </li>
                </ul>
              ) : acta.objetivos && acta.objetivos.length > 0 ? (
                <ul>
                  {acta.objetivos.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              ) : (
                <span>&nbsp;</span>
              )}
            </td>
          </tr>
          {/* Desarrollo */}
          <tr>
            <td
              colSpan={6}
              className="acta-section-header"
              style={{ textAlign: "center", background: "#f6f7f9" }}
            >
              DESARROLLO DE LA REUNIÓN
            </td>
          </tr>
          <tr>
            <td colSpan={6} className="editable-cell">
              <div
                ref={desarrolloRef}
                contentEditable={editable}
                suppressContentEditableWarning
                className="acta-editable"
                onBlur={() => handleFieldBlur("desarrollo", desarrolloRef)}
                dangerouslySetInnerHTML={{
                  __html: acta.desarrollo || "<p></p>",
                }}
                style={{
                  minHeight: 60,
                  outline: editable ? "1px dashed #bbb" : "none",
                  background: editable ? "#f5f8fa" : "inherit",
                }}
              />
            </td>
          </tr>
          {/* Conclusiones */}
          <tr>
            <td
              colSpan={6}
              className="acta-section-header"
              style={{ textAlign: "center", background: "#f6f7f9" }}
            >
              CONCLUSIONES
            </td>
          </tr>
          <tr>
            <td colSpan={6} className="editable-cell">
              <div
                ref={conclusionesRef}
                contentEditable={editable}
                suppressContentEditableWarning
                className="acta-editable"
                onBlur={() => handleFieldBlur("conclusiones", conclusionesRef)}
                dangerouslySetInnerHTML={{
                  __html: acta.conclusiones || "<p></p>",
                }}
                style={{
                  minHeight: 40,
                  outline: editable ? "1px dashed #bbb" : "none",
                  background: editable ? "#f5f8fa" : "inherit",
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <span style={{ fontWeight: "normal" }}>GOR-F-084V02</span>
      <br />
      <br />

      <div className="page-break" />

      {/* COMPROMISOS */}
      <img
        src={acta.logoUrl || "/logo_sena.png"}
        alt="Logo SENA"
        className="acta-logo"
      />
      <div className="acta-table-wrap">
        <table className="acta-table compromisos-table">
          <thead>
            <tr>
              <th colSpan={4}>ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS</th>
              {editable && <th className="no-print"></th>}
            </tr>
            <tr>
              <th>ACTIVIDAD / DECISIÓN</th>
              <th>FECHA</th>
              <th>RESPONSABLE</th>
              <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
              {editable && <th className="no-print"></th>}
            </tr>
          </thead>
          <tbody>
            {compromisos.map((c, idx) => (
              <tr key={idx}>
                <td>
                  {editable ? (
                    <input
                      value={c.actividad || ""}
                      onChange={(e) =>
                        handleCompromisoCell(idx, "actividad", e.target.value)
                      }
                    />
                  ) : (
                    c.actividad
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      value={c.fecha || ""}
                      onChange={(e) =>
                        handleCompromisoCell(idx, "fecha", e.target.value)
                      }
                    />
                  ) : (
                    c.fecha
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      value={c.responsable || ""}
                      onChange={(e) =>
                        handleCompromisoCell(idx, "responsable", e.target.value)
                      }
                    />
                  ) : (
                    c.responsable
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      value={c.firma || ""}
                      onChange={(e) =>
                        handleCompromisoCell(idx, "firma", e.target.value)
                      }
                    />
                  ) : (
                    c.firma
                  )}
                </td>
                {editable && (
                  <td className="no-print">
                    <button
                      type="button"
                      className="eliminar-btn"
                      onClick={() => removeCompromiso(idx)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {editable && (
          <div className="no-print add-btn-row">
            <button type="button" className="add-btn" onClick={addCompromiso}>
              + Agregar Compromiso
            </button>
          </div>
        )}
      </div>

      {/* ASISTENTES */}
      <div className="acta-table-wrap">
        <table className="acta-table asistentes-table">
          <thead>
            <tr>
              <th colSpan={5}>DE: ASISTENTES Y APROBACIÓN DE DECISIONES</th>
              {editable && <th className="no-print"></th>}
            </tr>
            <tr>
              <th>NOMBRE</th>
              <th>DEPENDENCIA / EMPRESA</th>
              <th>APRUEBA (SI/NO)</th>
              <th>OBSERVACIÓN</th>
              <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
              {editable && <th className="no-print"></th>}
            </tr>
          </thead>
          <tbody>
            {asistentes.map((a, idx) => (
              <tr key={idx}>
                <td>
                  {editable ? (
                    <input
                      value={a.nombre || ""}
                      onChange={(e) =>
                        handleAsistenteCell(idx, "nombre", e.target.value)
                      }
                    />
                  ) : (
                    a.nombre
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      value={a.dependencia || ""}
                      onChange={(e) =>
                        handleAsistenteCell(idx, "dependencia", e.target.value)
                      }
                    />
                  ) : (
                    a.dependencia
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      value={a.aprueba || ""}
                      onChange={(e) =>
                        handleAsistenteCell(idx, "aprueba", e.target.value)
                      }
                    />
                  ) : (
                    a.aprueba
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      value={a.observacion || ""}
                      onChange={(e) =>
                        handleAsistenteCell(idx, "observacion", e.target.value)
                      }
                    />
                  ) : (
                    a.observacion
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      value={a.firma || ""}
                      onChange={(e) =>
                        handleAsistenteCell(idx, "firma", e.target.value)
                      }
                    />
                  ) : (
                    a.firma
                  )}
                </td>
                {editable && (
                  <td className="no-print">
                    <button
                      type="button"
                      className="eliminar-btn"
                      onClick={() => removeAsistente(idx)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Botón para agregar asistentes */}

        {editable && (
          <div className="no-print add-btn-row">
            <button type="button" className="add-btn" onClick={addAsistente}>
              + Agregar Asistente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
