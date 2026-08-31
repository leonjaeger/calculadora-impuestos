/**
 * Molécula: fila del panel de tipo de cambio ("1 USD =" / "Bs 6.96").
 */
export default function RateRow({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{etiqueta}</p>
      <p className="text-xl font-semibold text-slate-900">{valor}</p>
    </div>
  )
}