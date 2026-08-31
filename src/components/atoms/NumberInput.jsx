/**
 * Átomo: campo de entrada numérico.
 *
 * El valor es texto (ver useCalculator) y aquí solo se filtran los
 * caracteres no numéricos: se aceptan indistintamente punto y coma
 * decimales, y la desambiguación final la hace parseNumberInput al
 * calcular. El usuario nunca ve cómo su entrada muta a un float.
 */
export default function NumberInput({ value, onChange, placeholder = '0.00', className = '', ...props }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={`card-input ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
      {...props}
    />
  )
}