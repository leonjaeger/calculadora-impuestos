// Utilidades numéricas: análisis tolerante de la entrada del usuario
// (punto o coma decimal) y formateo libre de artefactos de coma flotante.
//
// Error de las "comas flotantes" que se corrige aquí: en la app original
// (WinUI 3) el lector de XAML convertía "14.94" pasando por float, y
// float(14.94) redondeado a double es 14.93999958, que es lo que se veía
// en la casilla. En la web esto se evita por diseño:
//
//   1. Los campos numéricos guardan el texto tal como lo teclea el
//      usuario (nunca un float intermedio), y se analizan con
//      parseNumberInput al calcular.
//   2. Todo número que se muestra pasa antes por roundTo + un formateador
//      con 2 decimales; jamás se imprime un float crudo.

const FORMATO_MONEDA = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const FORMATO_CORTO = new Intl.NumberFormat('es-BO', {
  maximumFractionDigits: 2,
})

const FORMATO_TASA = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
})

/**
 * Redondea a `decimales` dígitos corrigiendo el error de representación
 * IEEE-754 (p. ej. redondear 8.145*100 con Math.round directo puede caer
 * en el entero equivocado). Con decimales = 2, 8.145 -> 8.15 y no 8.14.
 */
export function roundTo(valor, decimales = 2) {
  const factor = 10 ** decimales
  const corregido = (Math.abs(valor) + Number.EPSILON) * factor
  return (Math.sign(valor) || 1) * Math.round(corregido) / factor
}

/**
 * Convierte texto tecleado en número. Acepta coma o punto como separador
 * decimal ("14,94" y "14.94" valen lo mismo) y, cuando ambos aparecen,
 * el separador que ocupe la última posición es el decimal y el otro se
 * trata como separador de miles ("1.234,56" -> 1234.56). Si un mismo
 * separador se repite, agrupa miles solo cuando todos los grupos de la
 * derecha miden 3 dígitos ("1,234,567" -> 1234567); si no, el último es
 * decimal ("1,234,56" -> 1234.56). Un separador único es siempre decimal
 * ("1,234" -> 1.234, como en la app original).
 * Devuelve NaN si el texto no representa un número válido.
 */
export function parseNumberInput(texto) {
  if (typeof texto !== 'string') return NaN
  let s = texto.replace(/[\s\u00A0]/g, '')
  if (s === '') return NaN

  // Signo inicial opcional (los campos son >= 0, pero el parser es
  // genérico por si se reutiliza).
  let signo = 1
  if (s[0] === '+' || s[0] === '-') {
    signo = s[0] === '-' ? -1 : 1
    s = s.slice(1)
  }
  if (!/^[\d.,]+$/.test(s)) return NaN

  const ultimoPunto = s.lastIndexOf('.')
  const ultimaComa = s.lastIndexOf(',')

  if (ultimoPunto >= 0 && ultimaComa >= 0) {
    // Ambos separadores: el último es el decimal, el otro agrupa miles.
    const decimal = ultimaComa > ultimoPunto ? ',' : '.'
    const miles = decimal === ',' ? '.' : ','
    s = s.split(miles).join('').replace(',', '.')
  } else if (ultimoPunto >= 0 || ultimaComa >= 0) {
    // Un solo tipo de separador. Repetido: si todos los grupos de la
    // derecha miden 3 dígitos agrupa miles ("1,234,567"); si no, el
    // último es el decimal y los demás agrupan miles ("1,234,56" ->
    // 1234.56, típico error al teclear el punto de las centenas).
    // Único: siempre decimal.
    const separador = ultimoPunto >= 0 ? '.' : ','
    const grupos = s.split(separador)
    const decimalRepetido = grupos.length > 2
      && grupos.slice(1).some((g) => g.length !== 3)
    if (decimalRepetido) {
      s = grupos
        .slice(0, -1)
        .join('')
        .concat('.', grupos[grupos.length - 1])
    } else if (grupos.length > 2) {
      s = grupos.join('')
    }
    // length <= 2: dejar tal cual; la coma se convierte a punto abajo.
  }

  if (s.includes(',')) s = s.split(',').join('.')

  const valor = Number(s)
  return Number.isFinite(valor) ? signo * valor : NaN
}

/**
 * Analiza el texto de un campo y lo normaliza a un rango: usa
 * `porDefecto` cuando el texto está vacío o no es un número válido
 * (equivalente a Valor() de la app original, que devolvía 0 con NaN).
 */
export function toNumber(texto, { porDefecto = 0, min = 0, max = Infinity } = {}) {
  const valor = parseNumberInput(texto)
  if (!Number.isFinite(valor)) return porDefecto
  return Math.min(max, Math.max(min, valor))
}

/** Formato monetario a 2 decimales: "Bs 1.234,56". */
export function formatMoney(valor, simbolo = 'Bs') {
  return `${simbolo} ${FORMATO_MONEDA.format(roundTo(valor))}`
}

/** Formato numérico corto, hasta 2 decimales sin ceros de relleno. */
export function formatNumero(valor) {
  return FORMATO_CORTO.format(roundTo(valor))
}

/** Formato del factor de cambio con 4 decimales: "6,9470". */
export function formatTasa(valor) {
  return FORMATO_TASA.format(valor)
}