# word_generation.py
import logging
import os
from html import unescape
from html.parser import HTMLParser
from io import BytesIO

from docx.shared import Cm
from docxtpl import DocxTemplate, InlineImage, RichText

logger = logging.getLogger(__name__)

SALTO = '<w:r><w:br/></w:r>'
VINETA = '• '


class _HtmlARichText(HTMLParser):
    """Convierte el HTML del editor en runs de Word.

    El editor guarda parrafos y viñetas como HTML. Insertarlo tal cual en el
    XML del documento producia un archivo que Word no puede abrir, asi que
    aqui se traduce a runs con negrita, cursiva, subrayado y saltos de linea.
    """

    BLOQUES = {'p', 'div', 'li', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}
    NEGRITA = {'b', 'strong'}
    CURSIVA = {'i', 'em'}
    SUBRAYADO = {'u', 'ins'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rich = RichText()
        self._negrita = 0
        self._cursiva = 0
        self._subrayado = 0
        self._pendiente = False   # hay un salto de bloque por escribir
        self._con_texto = False   # ya se escribio algo

    def handle_starttag(self, tag, attrs):
        if tag in self.NEGRITA:
            self._negrita += 1
        elif tag in self.CURSIVA:
            self._cursiva += 1
        elif tag in self.SUBRAYADO:
            self._subrayado += 1
        elif tag == 'br':
            self._pendiente = True
        elif tag in self.BLOQUES:
            if self._con_texto:
                self._pendiente = True
            if tag == 'li':
                self._texto(VINETA, vineta=True)

    def handle_startendtag(self, tag, attrs):
        if tag == 'br':
            self._pendiente = True

    def handle_endtag(self, tag):
        if tag in self.NEGRITA:
            self._negrita = max(0, self._negrita - 1)
        elif tag in self.CURSIVA:
            self._cursiva = max(0, self._cursiva - 1)
        elif tag in self.SUBRAYADO:
            self._subrayado = max(0, self._subrayado - 1)
        elif tag in self.BLOQUES and self._con_texto:
            self._pendiente = True

    def handle_data(self, data):
        self._texto(data)

    def _texto(self, data, vineta=False):
        texto = data.replace('\xa0', ' ')
        if not vineta and not texto.strip():
            return
        if self._pendiente:
            self.rich.xml += SALTO
            self._pendiente = False
        self.rich.add(
            texto,
            bold=bool(self._negrita),
            italic=bool(self._cursiva),
            underline=bool(self._subrayado),
        )
        self._con_texto = True


def html_a_richtext(valor):
    """Devuelve un RichText listo para las etiquetas {{r ... }} de la plantilla."""
    texto = '' if valor is None else str(valor)
    if '<' not in texto:
        rich = RichText()
        for indice, linea in enumerate(unescape(texto).splitlines() or ['']):
            if indice:
                rich.xml += SALTO
            rich.add(linea)
        return rich
    parser = _HtmlARichText()
    parser.feed(texto)
    parser.close()
    return parser.rich


def generate_word_acta(context):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    template_path = os.path.join(base_dir, 'templates', 'acta_template.docx')

    doc_tpl = DocxTemplate(template_path)

    anexos = []
    for anexo in context.get("anexos", []):
        try:
            image = InlineImage(doc_tpl, anexo["image_path"], Cm(8))
            anexos.append({
                "filename": anexo["filename"],
                "image": image,
            })
        except Exception as e:
            logger.warning(
                f"No se pudo cargar la imagen '{anexo['filename']}' ({anexo['image_path']}): {e}"
            )
            anexos.append({
                "filename": anexo["filename"],
                "image": None,
                "error": str(e),
            })

    context = context.copy()
    context["anexos"] = anexos
    for campo in ("desarrollo", "conclusiones"):
        context[campo] = html_a_richtext(context.get(campo))

    doc_tpl.render(context)

    output = BytesIO()
    doc_tpl.save(output)
    output.seek(0)
    return output
