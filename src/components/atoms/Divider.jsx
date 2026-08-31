/**
 * Átomo: separador horizontal (equivalente al Border de 1 px de la app
 * original).
 */
export default function Divider({ className = '' }) {
  return <div className={`h-px bg-slate-200 ${className}`} />
}