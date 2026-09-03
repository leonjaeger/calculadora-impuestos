import { formatNumero } from '../../utils/number.js'
import { MONEDA_REFERENCIAL, simboloDe } from '../../utils/monedas.js'

/**
 * Molécula: fila de un cálculo guardado — nombre, resumen de sus
 * valores y botón de eliminar. Un clic recarga los valores en el
 * formulario (la app original usaba doble clic; en web el clic simple
 * es la convención).
 */
export default function SavedCalcItem({ item, onCargar, onEliminar }) {
  const simboloCostos = simboloDe(item.monedaCostos)
  const simboloReferencial = simboloDe(MONEDA_REFERENCIAL)
  const unidades = Math.max(1, item.referencialUnidades ?? 1)
  const resumen =
    `Ref ${simboloReferencial} ${formatNumero(item.referencial)} × ${unidades} · ` +
    `Gan ${Math.round(item.gananciaPct ?? 0)} % · ` +
    `Env ${simboloCostos} ${formatNumero(item.envio)} · ` +
    `Man ${simboloCostos} ${formatNumero(item.manipuleo)}`

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Recargar ${item.nombre ?? 'cálculo'} en el formulario`}
      className="group flex cursor-pointer items-start gap-1.5 rounded-lg p-2 transition-colors hover:bg-slate-50
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
      title="Clic para recargarlo en el formulario"
      onClick={() => onCargar(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onCargar(item)
        }
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="break-words text-xs font-medium text-slate-900">{item.nombre}</p>
        <p className="break-words text-[11px] text-slate-500">{resumen}</p>
      </div>
      <button
        type="button"
        aria-label="Eliminar"
        title="Eliminar"
        className="mt-0.5 rounded-md p-1.5 text-slate-400 transition-colors
          hover:bg-red-50 hover:text-carmesi"
        onClick={(e) => {
          e.stopPropagation()
          onEliminar(item.id)
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M5.5 5.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v.5h2.5a.5.5 0 0 1 0 1h-.576l-.496 6.15a1.5 1.5 0 0 1-1.494 1.35H5.566a1.5 1.5 0 0 1-1.494-1.35L3.576 7H3a.5.5 0 0 1 0-1h2.5v-.5Zm1 .5v.5h3V6h-3Zm-1.417 1 .478 5.906a.5.5 0 0 0 .498.45h4.682a.5.5 0 0 0 .498-.45L11.317 7H5.083Z" />
        </svg>
      </button>
    </div>
  )
}