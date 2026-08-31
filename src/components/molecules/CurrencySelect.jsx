import Select from '../atoms/Select.jsx'
import { MONEDAS } from '../../utils/monedas.js'

/**
 * Molécula: selector de moneda (USD, EUR, BOB).
 */
export default function CurrencySelect({ id, value, onChange }) {
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      {MONEDAS.map((m) => (
        <option key={m.codigo} value={m.codigo}>
          {m.nombre}
        </option>
      ))}
    </Select>
  )
}