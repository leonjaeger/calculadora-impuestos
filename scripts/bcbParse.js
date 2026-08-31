// Parser de la tabla de cotizaciones del BCB.
//
// Módulo puro compartido por el job diario de GitHub Actions
// (scripts/actualizar-cotizacion.mjs) y el middleware de desarrollo de
// Vite (vite.config.js). Debe correr en cualquier runtime de Node:
// nada de DOMParser ni APIs del navegador — solo String/RegExp/Number.
//
// Fuente: https://www.bcb.gob.bo/librerias/indicadores/otras/ultimo.php
// La tabla usa entidades HTML (&Oacute;, &nbsp;); se decodifican y se
// retira el marcado antes de buscar los anclajes "ESTADOS UNIDOS" y
// "UNIÓN EUROPEA" (equivalente al WebUtility.HtmlDecode + textContent
// del parser del navegador que usaba antes).

export const URL_INDICADORES =
  'https://www.bcb.gob.bo/librerias/indicadores/otras/ultimo.php'

// User-Agent propio: el BCB responde 403 a peticiones sin uno, y el
// dominio del sitio identifica de dónde vienen sus consultas.
export const USER_AGENT = 'CalculadoraDeImpuestos/1.0 (+web)'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// Entidades con nombre que usa la tabla del BCB, más las comunes.
const ENTIDADES = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  deg: '°', middot: '·', laquo: '«', raquo: '»', euro: '€',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ',
  Uuml: 'Ü', uuml: 'ü', Adieresis: 'Ä', adieresis: 'ä', ccedil: 'ç',
  agrav: 'à', egrave: 'è', igrave: 'ì', ograve: 'ò', ugrave: 'ù',
}

/** Decodifica entidades HTML nombradas y numéricas (&#233;, &#xE9;). */
export function decodificarEntidades(html) {
  return html.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (entidad, cuerpo) => {
    if (cuerpo[0] === '#') {
      const codigo = cuerpo[1] === 'x' || cuerpo[1] === 'X'
        ? parseInt(cuerpo.slice(2), 16)
        : parseInt(cuerpo.slice(1), 10)
      return Number.isFinite(codigo) ? String.fromCodePoint(codigo) : entidad
    }
    return ENTIDADES[cuerpo] ?? entidad
  })
}

/** Quita tildes y pasa a minúsculas ("Setiembre" y "Septiembre" casan). */
export function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Busca la primera tasa numérica en la ventana que sigue al ancla
 * (nombre del país). La tabla usa coma decimal, que se normaliza a
 * punto antes de convertir.
 */
export function buscarTasa(texto, ancla) {
  const idx = normalizar(texto).indexOf(normalizar(ancla))
  if (idx < 0) return null

  const ventana = texto.slice(idx, idx + 3000)
  const m = ventana.match(/\d+[.,]\d+/)
  if (!m) return null

  const valor = Number(m[0].replace(',', '.'))
  return Number.isFinite(valor) && valor > 0 ? valor : null
}

/**
 * Extrae la fecha de la cotización en formato yyyy-MM-dd. Acepta los dos
 * formatos que ha usado la tabla del BCB a lo largo del tiempo:
 *   "FECHA DE COTIZACIÓN: 24 de Agosto 2026"  (formato original)
 *   "COTIZACIONES DEL 30 DE AGOSTO DE 2026"   (formato actual)
 * Devuelve null si no aparece ninguna de las dos.
 */
export function extraerFecha(texto) {
  const m = texto.match(
    /(?:FECHA DE (?:LA )?COTIZACI[OÓ]N:|COTIZACIONES DEL)\s+(\d{1,2})\s+(?:de\s+)?([A-Za-zÁÉÍÓÚáéíóú]+)\s+(?:de\s+)?(\d{4})/i,
  )
  if (!m) return null

  const mes = MESES.indexOf(normalizar(m[2])) + 1
  const dia = Number(m[1])
  const anio = Number(m[3])
  if (mes <= 0 || !Number.isInteger(dia) || !Number.isInteger(anio)) return null
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/**
 * Parsea la tabla del BCB. Devuelve { fecha, bsPorUsd, bsPorEur } o null
 * si el formato no coincide (fecha null = no hallada; el llamador decide
 * qué fecha asignar).
 */
export function parsearBcb(html) {
  if (typeof html !== 'string' || html.length === 0) return null

  const texto = decodificarEntidades(html).replace(/<[^>]*>/g, ' ')
  const usd = buscarTasa(texto, 'ESTADOS UNIDOS')
  const eur = buscarTasa(texto, 'UNIÓN EUROPEA') ?? buscarTasa(texto, 'UNION EUROPEA')
  if (usd == null || eur == null) return null

  return { fecha: extraerFecha(texto), bsPorUsd: usd, bsPorEur: eur }
}