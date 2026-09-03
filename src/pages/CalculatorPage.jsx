import { useMemo, useState } from 'react'
import AppHeader from '../components/organisms/AppHeader.jsx'
import RatesPanel from '../components/organisms/RatesPanel.jsx'
import SavedPanel from '../components/organisms/SavedPanel.jsx'
import TaxesPanel from '../components/organisms/TaxesPanel.jsx'
import LocalCostsPanel from '../components/organisms/LocalCostsPanel.jsx'
import MainTemplate from '../components/templates/MainTemplate.jsx'
import SaveCalcDialog from '../components/molecules/SaveCalcDialog.jsx'
import { useBcbRates } from '../hooks/useBcbRates.js'
import { useSavedCalculations } from '../hooks/useSavedCalculations.js'
import { useCalculator } from '../hooks/useCalculator.js'
import { impuestos as calcularImpuestos, precioFinal } from '../utils/calculos.js'
import { toNumber } from '../utils/number.js'
import { MONEDA_REFERENCIAL } from '../utils/monedas.js'

/**
 * Página única de la calculadora. Toda la lógica de cálculo se deriva
 * del estado del formulario (useCalculator) y de la cotización vigente
 * (useBcbRates); los componentes solo muestran resultados ya
 * formateados, sin lógica de negocio.
 */
export default function CalculatorPage() {
  const { cotizacion, estado, actualizar } = useBcbRates()
  const { campos, setCampo, reiniciar, cargarGuardado } = useCalculator()
  const { guardados, agregar, eliminar } = useSavedCalculations()
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [nombreSugerido, setNombreSugerido] = useState('')

  // Cuántas unidades de cada moneda equivalen a 1 USD, derivado de la
  // cotización del BCB (Bs por USD y Bs por EUR).
  const unidadesPorUsd = useMemo(() => ({
    USD: 1,
    BOB: cotizacion.bsPorUsd,
    EUR: cotizacion.bsPorUsd / cotizacion.bsPorEur,
  }), [cotizacion])

  const {
    factor, impuestos: resultadoImpuestos, local,
  } = useMemo(() => {
    // Factores de conversión (entrada -> salida y costos -> salida).
    const factor = unidadesPorUsd[campos.monedaSalida] / unidadesPorUsd[campos.monedaEntrada]
    const factorCostos = unidadesPorUsd[campos.monedaSalida] / unidadesPorUsd[campos.monedaCostos]
    // El precio referencial es siempre en bolivianos: no sigue al
    // selector de moneda de los costos, se convierte por su cuenta.
    const factorReferencial = unidadesPorUsd[campos.monedaSalida] / unidadesPorUsd[MONEDA_REFERENCIAL]

    // Subtotal del conjunto: unidades × precio unitario, convertido a
    // la moneda de salida. El GA y el IVA se aplican a este subtotal (al
    // total del lote), no por unidad.
    const precioUnitario = toNumber(campos.precioBase)
    const unidades = Math.max(1, toNumber(campos.unidades, { porDefecto: 1 }))
    const subtotal = precioUnitario * unidades * factor
    const resultado = calcularImpuestos(
      subtotal,
      toNumber(campos.tasaIva, { min: 0, max: 100 }),
      toNumber(campos.ga, { min: 0, max: 100 }),
    )

    // Panel de costos locales: referencial siempre en Bs; envío y
    // manipuleo capturados en la moneda del selector de costos.
    const referencialUnitario = toNumber(campos.referencial) * factorReferencial
    const referencialUnidades = Math.max(1, toNumber(campos.referencialUnidades, { porDefecto: 1 }))
    const envio = toNumber(campos.envio) * factorCostos
    const manipuleo = toNumber(campos.manipuleo) * factorCostos
    const gananciaPct = Math.min(100, Math.max(0, campos.gananciaPct))

    const final = precioFinal(
      resultado.total, envio, manipuleo, unidades, gananciaPct, referencialUnitario,
    )

    return {
      factor,
      impuestos: resultado,
      local: {
        ...final,
        gananciaPct,
        totalImportado: resultado.total,
        envio,
        manipuleo,
        referencialUnitario,
        referencialTotal: referencialUnitario * referencialUnidades,
      },
    }
  }, [campos, unidadesPorUsd])

  /** Nombre propuesto para "Guardar como", con fecha y hora del momento. */
  const sugerirNombre = () => {
    const ahora = new Date()
    const dd = String(ahora.getDate()).padStart(2, '0')
    const mm = String(ahora.getMonth() + 1).padStart(2, '0')
    const hh = String(ahora.getHours()).padStart(2, '0')
    const mi = String(ahora.getMinutes()).padStart(2, '0')
    return `Cálculo del ${dd}/${mm}/${ahora.getFullYear()} ${hh}:${mi}`
  }

  /** Texto vacío → null, para que el campo vuelva vacío al recargar. */
  const numeroOvacio = (texto) => (texto.trim() === '' ? null : toNumber(texto))

  const guardar = (nombre) => {
    setDialogoAbierto(false)
    agregar({
      nombre,
      referencial: numeroOvacio(campos.referencial),
      referencialUnidades: Math.max(1, toNumber(campos.referencialUnidades, { porDefecto: 1 })),
      gananciaPct: campos.gananciaPct,
      envio: numeroOvacio(campos.envio),
      manipuleo: numeroOvacio(campos.manipuleo),
      monedaCostos: campos.monedaCostos,
    })
  }

  return (
    <>
      <MainTemplate
      header={<AppHeader />}
      lateral={(
        <>
          <RatesPanel cotizacion={cotizacion} estado={estado} onActualizar={actualizar} />
          <SavedPanel guardados={guardados} onCargar={cargarGuardado} onEliminar={eliminar} />
        </>
      )}
      calculadora={(
        <div className="card max-w-4xl p-6 sm:p-8">
          <div className="grid items-start gap-10 xl:grid-cols-2">
            <TaxesPanel
              campos={campos}
              setCampo={setCampo}
              factor={factor}
              impuestos={resultadoImpuestos}
              onReiniciar={reiniciar}
            />
            <LocalCostsPanel
              campos={campos}
              setCampo={setCampo}
              local={local}
              onGuardarComo={() => {
                setNombreSugerido(sugerirNombre())
                setDialogoAbierto(true)
              }}
            />
          </div>
        </div>
      )}
    />
      <SaveCalcDialog
        abierto={dialogoAbierto}
        nombreSugerido={nombreSugerido}
        onGuardar={guardar}
        onCancelar={() => setDialogoAbierto(false)}
      />
    </>
  )
}