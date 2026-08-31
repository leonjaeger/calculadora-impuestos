/**
 * Átomo: lista desplegable con el estilo de la tarjeta.
 */
export default function Select({ className = '', ...props }) {
  return (
    <select
      className={`card-input cursor-pointer ${className}`}
      {...props}
    />
  )
}