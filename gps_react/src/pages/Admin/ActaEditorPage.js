import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Loader, Message, Icon } from "semantic-ui-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { useActaVersions } from "../../hooks/useActaVersions";
import { getMeetingSessionApi } from "../../api/meetingSession";
import { descargarActaWord } from "../../api/actaWord";
import { ActaTemplateEditor } from "../../components/Admin/ActaTemplateEditor";
import logoSena from "../../assets/images/logo_sena.png";

export function ActaEditorPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;
  const { versions, loading, error, save } = useActaVersions(sessionId, token);
  const [sessionError, setSessionError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const ultimaVersion = versions[0] || null;

  const actaPrintRef = useRef(null);

  // Estado para datos de sesión/reunión
  const [sessionInfo, setSessionInfo] = useState(null);
  const [actaData, setActaData] = useState(null);
  const [compromisos, setCompromisos] = useState([]);
  const [asistentes, setAsistentes] = useState([]);

  // 1. Carga los datos de la sesión (incluye meeting.title, start_datetime, end_datetime)
  useEffect(() => {
    if (!sessionId || !token) return;
    setSessionError(false);
    getMeetingSessionApi(sessionId, token)
      .then(setSessionInfo)
      .catch(() => {
        setSessionInfo(null);
        setSessionError(true);
      });
  }, [sessionId, token]);

  // 2. Cuando llegan los datos de la versión Y la sesión, rellena actaData
  useEffect(() => {
    if (!sessionInfo) return;
    const version = versions[0] || {};

    // ---- ESTA ES LA CLAVE: siempre toma primero version.reunion ----
    setActaData({
      numero: version.version || "01",
      comite:
        version.reunion || // <-- la fuente prioritaria
        sessionInfo.title ||
        sessionInfo.meeting_title ||
        sessionInfo.meeting?.title ||
        "",
      ciudad: version.ciudad || "",
      fecha: sessionInfo.start_datetime
        ? new Date(sessionInfo.start_datetime).toLocaleDateString("es-CO")
        : "",
      hora_inicio: sessionInfo.start_datetime
        ? new Date(sessionInfo.start_datetime).toLocaleTimeString("es-CO", {
            hour12: true,
          })
        : "",
      hora_fin: sessionInfo.end_datetime
        ? new Date(sessionInfo.end_datetime).toLocaleTimeString("es-CO", {
            hour12: true,
          })
        : "",
      lugar: version.lugar || "",
      enlace: version.enlace || "",
      centro: version.centro || "",
      agenda: version.agenda || [],
      objetivos: version.objetivos || [],
      desarrollo: version.desarrollo || version.content_html || "",
      conclusiones: version.conclusiones || "",
      logoUrl: logoSena,
    });
    setCompromisos(version.compromisos || []);
    setAsistentes(version.asistentes || []);
  }, [versions, sessionInfo]);

  function handleFieldChange(field, value) {
    setActaData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      // numero, comite, fecha y horas se derivan de la sesion: no son campos
      // del acta y enviarlos solo generaria confusion.
      const { ciudad, lugar, enlace, centro, agenda, objetivos, desarrollo, conclusiones } =
        actaData;
      await save({
        ciudad,
        lugar,
        enlace,
        centro,
        agenda,
        objetivos,
        desarrollo,
        conclusiones,
        compromisos,
        asistentes,
      });
      toast.success("Acta guardada correctamente.");
      navigate("/actas");
    } catch (err) {
      console.error("Error al guardar acta:", err);
      toast.error(
        err.message || "No se pudo guardar el acta. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDescargarWord = async () => {
    if (!ultimaVersion) {
      toast.info("Guarda el acta antes de descargarla en Word.");
      return;
    }
    setDescargando(true);
    try {
      const titulo = (actaData?.comite || "Acta").replace(/[\\/:*?"<>|]/g, "-");
      await descargarActaWord(
        ultimaVersion.id,
        token,
        `${titulo}_v${ultimaVersion.version}.docx`,
      );
    } catch (e) {
      toast.error(e.message || "No se pudo descargar el acta.");
    } finally {
      setDescargando(false);
    }
  };

  const handlePrint = () => {
    if (actaPrintRef.current) {
      const printContents = actaPrintRef.current.innerHTML;
      const win = window.open("", "", "height=900,width=700");
      if (!win) {
        toast.error("Permite las ventanas emergentes para imprimir el acta.");
        return;
      }
      win.document.write(`
        <html>
          <head>
            <title></title>
            <style>
              ${document.getElementById("print-styles")?.innerHTML || ""}
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      win.document.close();
      setTimeout(() => {
        win.focus();
        win.print();
        win.close();
      }, 500);
    }
  };

  if (error || sessionError)
    return (
      <Message negative role="alert">
        {error || "La sesión no existe o no tienes acceso."}
        <Button onClick={() => navigate("/actas")}>Volver a actas</Button>
      </Message>
    );
  if (loading || !actaData) {
    return (
      <Loader active inline="centered">
        Cargando acta...
      </Loader>
    );
  }

  return (
    <div>
      <div className="page-heading no-print">
        <div>
          <p className="eyebrow">DOCUMENTACIÓN DE LA REUNIÓN</p>
          <h1>Editor de acta</h1>
          <p className="page-subtitle">
            {sessionInfo?.meeting_title} · Sesión {sessionId}
          </p>
        </div>
        <Button onClick={() => navigate("/actas")} disabled={saving}>
          <Icon name="arrow left" />
          Volver a actas
        </Button>
      </div>
      <Button onClick={handlePrint} className="no-print">
        <Icon name="print" />
        Imprimir acta
      </Button>
      <Button
        onClick={handleDescargarWord}
        className="no-print"
        loading={descargando}
        disabled={descargando || !ultimaVersion}
        style={{ marginLeft: 10 }}
        title={
          ultimaVersion
            ? "Descargar el acta en Word"
            : "Guarda el acta para poder descargarla"
        }
      >
        <Icon name="download" />
        Descargar Word
      </Button>
      <Button
        onClick={handleSave}
        primary
        loading={saving}
        disabled={saving}
        className="no-print"
        style={{ marginLeft: 10 }}
      >
        Guardar acta
      </Button>

      <div ref={actaPrintRef}>
        <ActaTemplateEditor
          acta={actaData}
          compromisos={compromisos}
          asistentes={asistentes}
          onChangeCompromisos={setCompromisos}
          onChangeAsistentes={setAsistentes}
          onFieldChange={handleFieldChange}
          editable={true}
        />
      </div>
      <style id="print-styles">{`
        @media print {
          .no-print { display: none !important; }
        }
        .page-break {
          display: block;
          height: 32px;
          margin-bottom: 16px;
          page-break-after: always;
        }
        .acta-template {
          max-width: 900px;
          margin: 0 auto;
          background: #fff;
          padding: 32px 24px 40px 24px;
          border-radius: 10px;
          font-size: 14px;
        }
        .acta-logo {
          display: block;
          margin: 0 auto 15px auto;
          max-width: 120px;
        }
        .acta-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-bottom: 18px;
        }
        .acta-table th, .acta-table td {
          border: 1px solid #222;
          padding: 6px 6px;
          vertical-align: top;
          text-align: left;
        }
        .acta-table th {
          font-weight: bold;
          background: #f5f7f6;
          text-align: center;
        }
        .acta-header {
          background: #e6f6ef;
          font-size: 17px;
          text-align: center;
          font-weight: bold;
        }
        .acta-section-header {
          background: #f6f7f9;
          font-weight: bold;
          text-align: center;
          font-size: 15px;
        }
        .editable-cell { background: #f5f8fa; }
        .acta-editable:focus { outline: 2px solid #2684ff; background: #fffbe9; }
      `}</style>
    </div>
  );
}
