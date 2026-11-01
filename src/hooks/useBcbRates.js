import { useCallback, useEffect, useRef, useState } from 'react'
import {
  COTIZACION_PROVISIONAL,
  obtenerCotizacion,
} from '../services/bcbCotizaciones.js'

// Cada cuánto se reintenta mientras la cotización mostrada sea de un día
// anterior (el bot de GitHub Actions publica la del día con retraso).
const REINTENTO_DESACTUALIZADA_MS = 30 * 60_000

/** Fecha local de hoy en formato yyyy-MM-dd (mismo formato que `fecha`). */
function hoyIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Cotizaciones del BCB: descarga en segundo plano al montar, caché por
 * día y refresco automático con la pestaña abierta (comprueba cada
 * minuto, como el temporizador de la app original):
 *   - al cruzar medianoche, y
 *   - cada 30 min mientras la cotización mostrada sea de un día anterior
 *     a hoy (o provisional): el JSON del día puede llegar horas después
 *     de la medianoche, y sin esto la pestaña se quedaba con la de ayer.
 * Si no hay red ni caché, se queda con las tasas provisionales y el
 * panel muestra el error.
 *
 * `estado` es uno de: 'inicial' | 'cargando' | 'actualizando' | 'ok' |
 * 'desactualizado' (se muestra caché de respaldo tras fallar el
 * refresco) | 'error'.
 */
export function useBcbRates() {
  const [cotizacion, setCotizacion] = useState(COTIZACION_PROVISIONAL)
  const [estado, setEstado] = useState('inicial')
  // Día local para el que ya se intentó una carga; detecta el cruce de
  // medianoche con la pestaña abierta.
  const diaCargado = useRef(null)
  // Momento del último intento y fecha de la cotización que se muestra,
  // para decidir los reintentos mientras esté desactualizada.
  const ultimoIntento = useRef(0)
  const fechaMostrada = useRef(null)

  const cargar = useCallback(async (forzar) => {
    setEstado(forzar ? 'actualizando' : 'cargando')
    ultimoIntento.current = Date.now()
    const resultado = await obtenerCotizacion(forzar)
    // Se marca también en caso de fallo para no reintentar cada minuto;
    // el botón Actualizar permite forzar un reintento manual.
    diaCargado.current = new Date().toDateString()

    if (resultado) {
      setCotizacion(resultado.cotizacion)
      fechaMostrada.current = resultado.cotizacion.fecha
      // Con caché de respaldo el panel sigue mostrando datos, pero se
      // avisa: lo mostrado puede estar desactualizado.
      setEstado(resultado.refrescoOk ? 'ok' : 'desactualizado')
    } else {
      fechaMostrada.current = null
      setEstado('error')
    }
  }, [])

  useEffect(() => {
    cargar(false)
    const id = setInterval(() => {
      if (!diaCargado.current) return // primera carga aún en curso
      const cruzoMedianoche = diaCargado.current !== new Date().toDateString()
      const desactualizada = !fechaMostrada.current || fechaMostrada.current < hoyIso()
      const toca = Date.now() - ultimoIntento.current >= REINTENTO_DESACTUALIZADA_MS
      if (cruzoMedianoche || (desactualizada && toca)) {
        cargar(false)
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [cargar])

  return { cotizacion, estado, actualizar: () => cargar(true) }
}
