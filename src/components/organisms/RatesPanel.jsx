import Button from '../atoms/Button.jsx'
import Divider from '../atoms/Divider.jsx'
import RateRow from '../molecules/RateRow.jsx'
import { formatMoney } from '../../utils/number.js'

/** 'yyyy-MM-dd' → 'dd/MM/yyyy' sin parsear fechas a Date (sin desfases). */
function fechaCorta(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

/** Timestamp UTC del BCB → 'dd/MM/yyyy hh:mm' de la zona del visitante. */
function fechaHoraLocal(iso) {
  const d = new Date(iso ?? '')
  if (Number.isNaN(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`
}

/**
 * Organismo: panel del tipo de cambio en bolivianos (cotización oficial
 * del BCB), con la fuente, la fecha que declara la tabla del BCB (que
 * puede marcar el día siguiente: el BCB publica unas horas antes de la
 * medianoche local), el momento de publicación en hora local y el botón
 * de actualización manual.
 */
export default function RatesPanel({ cotizacion, estado, onActualizar }) {
  const cargando = estado === 'cargando' || estado === 'actualizando'
  const publicada = fechaHoraLocal(cotizacion.actualizado)

  const mensaje =
    estado === 'actualizando'
      ? 'Actualizando tasas (BCB)…'
      : estado === 'ok' || estado === 'desactualizado'
        ? (estado === 'desactualizado'
          ? 'No se pudo actualizar; se muestra la última cotización guardada.\n'
          : 'Fuente: BCB\n')
          + (cotizacion.fecha
            ? `Cotización del ${fechaCorta(cotizacion.fecha)}`
            : 'Tasas provisionales (sin conexión)')
          + (publicada ? `\nPublicada: ${publicada}` : '')
        : estado === 'error'
          ? 'No se pudo actualizar el tipo de cambio (usando tasas provisionales).'
          : ''

  return (
    <section className="card w-full p-5 lg:w-60" aria-label="Tipo de cambio">
      <h2 className="mb-3.5 text-sm font-semibold text-slate-900">Tipo de cambio (Bs)</h2>
      <div className="grid gap-3.5">
        <RateRow etiqueta="1 USD =" valor={formatMoney(cotizacion.bsPorUsd)} />
        <RateRow etiqueta="1 EUR =" valor={formatMoney(cotizacion.bsPorEur)} />
        <RateRow etiqueta="1 BOB =" valor="Bs 1.00" />
        <Divider />
        <p className="whitespace-pre-line text-xs text-slate-500">{mensaje}</p>
        <Button className="w-full" disabled={cargando} onClick={onActualizar}>
          Actualizar
        </Button>
      </div>
    </section>
  )
}