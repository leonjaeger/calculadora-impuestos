// Obtiene el tipo de cambio oficial del Banco Central de Bolivia (BCB),
// con caché local (localStorage) válida para el día: la cotización solo
// cambia una vez al día, así que cada navegador consulta como máximo
// una vez por día y el resto de navegaciones sale de su caché local.
//
// El parsing del HTML del BCB NO ocurre en el navegador: se consume un
// JSON ya procesado ({ fecha, bsPorUsd, bsPorEur, actualizado }).
//   - Desarrollo: /api/bcb — middleware de Vite (vite.config.js) con
//     el parser compartido (scripts/bcbParse.js), en vivo.
//   - Producción: /cotizacion.json — archivo estático del propio sitio,
//     escrito una vez al día por GitHub Actions
//     (.github/workflows/cotizacion.yml) con el mismo parser. Estático
//     y del mismo origen: sin CORS y sin proxy en ejecución.
//
// Si la descarga falla, se usa la caché local (aunque sea de otro día)
// y, en último caso, las tasas provisionales del hook.

const URL_API = import.meta.env.VITE_BCB_URL ?? (import.meta.env.PROD ? '/cotizacion.json' : '/api/bcb')
const CLAVE_CACHE = 'calculadora-impuestos:bcb-rates'

// Tasas provisionales de respaldo (≈ 1 USD = 11.50 BOB, ≈ 1 EUR = 13.43 BOB).
export const COTIZACION_PROVISIONAL = { fecha: null, bsPorUsd: 11.5, bsPorEur: 13.43 }

/** Fecha local de hoy en formato yyyy-MM-dd. */
function hoyLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function leerCache() {
  try {
    const cruda = localStorage.getItem(CLAVE_CACHE)
    if (!cruda) return null
    const c = JSON.parse(cruda)
    if (typeof c.fecha === 'string'
      && typeof c.bsPorUsd === 'number' && c.bsPorUsd > 0
      && typeof c.bsPorEur === 'number' && c.bsPorEur > 0) {
      return c
    }
  } catch {
    // localStorage ilegible o no disponible: se ignora la caché.
  }
  return null
}

function escribirCache(cotizacion) {
  try {
    localStorage.setItem(CLAVE_CACHE, JSON.stringify(cotizacion))
  } catch {
    // Sin almacenamiento disponible: solo se pierde la caché.
  }
}

/**
 * Devuelve la cotización del día junto con cómo se obtuvo:
 *   - deCache: proviene de la caché local (true) o del endpoint (false).
 *   - refrescoOk: el último intento de consulta al endpoint funcionó o
 *     no fue necesario; false cuando la consulta falló y se respondió
 *     con la caché de respaldo — útil para avisar al usuario de que lo
 *     que se muestra puede estar desactualizado.
 * Usa la caché si es de hoy; si no, consulta el endpoint (JSON ya
 * procesado). Si la consulta falla pero existe caché (aunque sea de
 * otro día), la usa como respaldo. Devuelve null si no hay nada.
 * @param {boolean} forzar Ignora la caché y consulta siempre.
 */
export async function obtenerCotizacion(forzar = false) {
  const hoy = hoyLocal()
  const cache = leerCache()

  if (!forzar && cache && cache.fecha === hoy) {
    return { cotizacion: cache, deCache: true, refrescoOk: true }
  }

  try {
    const resp = await fetch(URL_API)
    if (!resp.ok) throw new Error(`${URL_API} respondió ${resp.status}`)

    const datos = await resp.json()
    const cotizacion = {
      fecha: typeof datos.fecha === 'string' && datos.fecha ? datos.fecha : hoy,
      bsPorUsd: Number(datos.bsPorUsd),
      bsPorEur: Number(datos.bsPorEur),
    }
    const valida = Number.isFinite(cotizacion.bsPorUsd) && cotizacion.bsPorUsd > 0
      && Number.isFinite(cotizacion.bsPorEur) && cotizacion.bsPorEur > 0
    if (!valida) throw new Error('respuesta del endpoint incompleta')

    escribirCache(cotizacion)
    return { cotizacion, deCache: false, refrescoOk: true }
  } catch {
    // Respaldo: usar caché aunque esté desactualizada (o nada), pero
    // dejando constancia de que el refresco falló.
    return cache ? { cotizacion: cache, deCache: true, refrescoOk: false } : null
  }
}