/**
 * Átomo: botón reutilizable con variantes de estilo.
 */
export default function Button({ variant = 'default', className = '', ...props }) {
  const variantes = {
    default: 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50',
    primary: 'bg-slate-800 text-white border border-transparent hover:bg-slate-700',
    danger: 'bg-white text-carmesi border border-slate-300 hover:bg-slate-50',
  }
  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors
        focus-visible:border-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300
        disabled:pointer-events-none disabled:opacity-50 ${variantes[variant]} ${className}`}
      {...props}
    />
  )
}