/**
 * Átomo: etiqueta de un campo del formulario.
 */
export default function Label({ children, htmlFor, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-semibold text-slate-900 ${className}`}>
      {children}
    </label>
  )
}