import Label from '../atoms/Label.jsx'

/**
 * Molécula: etiqueta + control de un campo del formulario.
 */
export default function Field({ label, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}