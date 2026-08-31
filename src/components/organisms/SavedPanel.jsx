import SavedCalcItem from '../molecules/SavedCalcItem.jsx'

/**
 * Organismo: panel de los cálculos guardados (persistidos en el
 * localStorage, como el guardados.json de la app original).
 */
export default function SavedPanel({ guardados, onCargar, onEliminar }) {
  return (
    <section className="card w-full p-5 lg:w-60" aria-label="Cálculos guardados">
      <h2 className="text-sm font-semibold text-slate-900">Guardados</h2>
      <p className="mt-1 text-xs text-slate-500">
        Clic en un cálculo para recargarlo en el formulario.
      </p>
      {guardados.length > 0 && (
        <div className="mt-2.5 grid gap-1">
          {guardados.map((g) => (
            <SavedCalcItem key={g.id} item={g} onCargar={onCargar} onEliminar={onEliminar} />
          ))}
        </div>
      )}
      {guardados.length === 0 && (
        <p className="mt-2.5 text-xs text-slate-500">Sin cálculos guardados todavía.</p>
      )}
    </section>
  )
}