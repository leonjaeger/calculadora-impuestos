// Monedas soportadas y sus símbolos (iguales que en la app original).

export const MONEDAS = [
  { codigo: 'USD', nombre: 'Dólares (USD)', simbolo: 'US$' },
  { codigo: 'EUR', nombre: 'Euros (EUR)', simbolo: '€' },
  { codigo: 'BOB', nombre: 'Bolivianos (BOB)', simbolo: 'Bs' },
]

/** Moneda fija del precio referencial local: siempre bolivianos. */
export const MONEDA_REFERENCIAL = 'BOB'

/** Símbolo de una moneda por su código; '$' si es desconocida. */
export function simboloDe(codigo) {
  return MONEDAS.find((m) => m.codigo === codigo)?.simbolo ?? '$'
}