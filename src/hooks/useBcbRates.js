import { useCallback, useEffect, useRef, useState } from 'react'
import {
  COTIZACION_PROVISIONAL,
  obtenerCotizacion,
} from '../services/bcbCotizaciones.js'

/**
 * Cotizaciones del BCB: descarga en segundo plano al montar, caché por
 * día y refresco automático al cruzar medianoche (comprueba cada minuto,
 * como el temporizador de la app original). Si no hay red ni caché, se
 * queda con las tasas provisionales y el panel muestra el error.
 *
 * `estado` es uno de: 'inicial' | 'cargando' | 'actualizando' | 'ok' | 'error'.
 */
export function useBcbRates() {
  const [cotizacion, setCotizacion] = useState(COTIZACION_PROVISIONAL)
  const [estado, setEstado] = useState('inicial')
  // Día local para el que ya se intentó una carga; detecta el cruce de
  // medianoche con la pestaña abierta.
  const diaCargado = useRef(null)

  const cargar = useCallback(async (forzar) => {
    setEstado(forzar ? 'actualizando' : 'cargando')
    const resultado = await obtenerCotizacion(forzar)
    // Se marca también en caso de fallo para no reintentar cada minuto;
    // el botón Actualizar permite forzar un reintento manual.
    diaCargado.current = new Date().toDateString()

    if (resultado) {
      setCotizacion(resultado.cotizacion)
      setEstado('ok')
    } else {
      setEstado('error')
    }
  }, [])

  useEffect(() => {
    cargar(false)
    const id = setInterval(() => {
      const hoy = new Date().toDateString()
      if (diaCargado.current && diaCargado.current !== hoy) {
        cargar(false)
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [cargar])

  return { cotizacion, estado, actualizar: () => cargar(true) }
}