import { formatMoney } from '../../utils/number.js'

/* Escala tipográfica de montos: 16 (totales, peso medio) → 18 (resultados
   secundarios) → 22 (comparativa) → 26 (resultado destacado). Los números
   van en dígitos tabulares para que los montos no "bailen" ni se
   desalineen al cambiar de valor. */
const TAMANOS = {
  sm: 'text-base font-medium tabular-nums',
  md: 'text-lg font-semibold tabular-nums',
  lg: 'text-[22px] font-semibold tabular-nums',
  xl: 'text-[26px] font-semibold tabular-nums',
}

/**
 * Átomo: cantidad monetaria formateada. Todo número que se muestra pasa
 * por formatMoney (redondeo + 2 decimales), así un float jamás se
 * presenta crudo — p. ej. 14.94 nunca aparece como 14.93999958.
 */
export default function Amount({ valor, simbolo = 'Bs', size = 'md', className = '' }) {
  return (
    <p className={`break-words ${TAMANOS[size]} ${className}`}>
      {formatMoney(valor, simbolo)}
    </p>
  )
}