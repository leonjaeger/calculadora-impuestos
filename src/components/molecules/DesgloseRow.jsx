import { formatMoney } from '../../utils/number.js'

/**
 * Molécula: fila del desglose del lote (etiqueta a la izquierda,
 * cantidad a la derecha).
 */
export default function DesgloseRow({ etiqueta, valor, simbolo = 'Bs' }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-slate-500">{etiqueta}</span>
      <span className="font-semibold text-slate-900">{formatMoney(valor, simbolo)}</span>
    </div>
  )
}