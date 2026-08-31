import { useCallback, useState } from 'react'

/**
 * Estado del formulario de la calculadora.
 *
 * Los campos numéricos se guardan como texto tal como los teclea el
 * usuario (no como float): así "14,94" y "14.94" no mutan al escribirse
 * y se analizan con parseNumberInput solo al calcular. Este es el otro
 * pilar del arreglo del error de las comas flotantes — en la app
 * original el valor se convertía a float al confirmar y el XAML incluso
 * mostraba 14.93999958 para el IVA inicial 14.94.
 */
export const CAMPOS_INICIALES = {
  monedaEntrada: 'BOB',
  monedaSalida: 'BOB',
  monedaCostos: 'BOB',
  precioBase: '',
  unidades: '1',
  tasaIva: '14.94',
  ga: '0',
  gananciaPct: 0,
  referencial: '',
  referencialUnidades: '1',
  envio: '',
  manipuleo: '',
}

export function useCalculator() {
  const [campos, setCampos] = useState(CAMPOS_INICIALES)

  const setCampo = useCallback((nombre, valor) => {
    setCampos((anteriores) => ({ ...anteriores, [nombre]: valor }))
  }, [])

  /** Restaura todos los campos (botón Reiniciar). */
  const reiniciar = useCallback(() => setCampos(CAMPOS_INICIALES), [])

  /**
   * Recarga un cálculo guardado en el formulario: restaura los valores
   * tal como se capturaron — envío y manipuleo en la moneda guardada,
   * referencial siempre en bolivianos — y las conversiones se
   * recalculan con el tipo de cambio vigente.
   */
  const cargarGuardado = useCallback((guardado) => {
    setCampos((anteriores) => ({
      ...anteriores,
      referencial: String(guardado.referencial ?? ''),
      referencialUnidades: String(Math.max(1, guardado.referencialUnidades ?? 1)),
      gananciaPct: guardado.gananciaPct ?? 0,
      envio: String(guardado.envio ?? ''),
      manipuleo: String(guardado.manipuleo ?? ''),
      monedaCostos: guardado.monedaCostos ?? 'BOB',
    }))
  }, [])

  return { campos, setCampo, reiniciar, cargarGuardado }
}