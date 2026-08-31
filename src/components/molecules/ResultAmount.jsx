import Amount from '../atoms/Amount.jsx'

/**
 * Molécula: resultado etiquetado (etiqueta pequeña sobre la cantidad
 * formateada). `size` se hereda del átomo Amount.
 */
export default function ResultAmount({ etiqueta, valor, simbolo, size = 'md', className = '' }) {
  return (
    <div className={className}>
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <Amount valor={valor} simbolo={simbolo} size={size} />
    </div>
  )
}