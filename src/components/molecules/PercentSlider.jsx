/**
 * Molécula: deslizador de porcentaje de ganancia (0-100 %), con el
 * valor actual a la derecha y marcas cada 10 %.
 */
export default function PercentSlider({ id, value, onChange }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-900">
          Porcentaje de ganancia buscado
        </label>
        <span className="text-sm font-semibold">{Math.round(value)} %</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        list="marcas-ganancia"
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-slate-800"
      />
      <datalist id="marcas-ganancia">
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>
    </div>
  )
}