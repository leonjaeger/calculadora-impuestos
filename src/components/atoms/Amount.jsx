import { formatMoney } from '../../utils/number.js'

const TAMANOS = {
  sm: 'text-base font-semibold',
  md: 'text-xl font-semibold',
  lg: 'text-2xl font-semibold',
  xl: 'text-[22px] font-semibold',
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