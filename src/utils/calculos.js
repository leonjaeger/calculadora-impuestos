// Cálculos puros de la calculadora, sin dependencias de la UI (puerto
// directo de Calculos.cs de la app WinUI 3). Los resultados no se
// redondean aquí: el redondeo es responsabilidad de la capa de
// presentación (utils/number.js), para no acumular errores de coma
// flotante en pasos intermedios.

/**
 * Calcula el gravamen arancelario (GA), el impuesto (IVA) y el total de
 * importación a partir del subtotal del lote (unidades × precio
 * unitario, ya convertido a la moneda de salida). El GA se aplica sobre
 * el subtotal (CIF) y el IVA sobre (subtotal + GA), como en el despacho
 * aduanero. Con GA = 0 el IVA equivale al cálculo solo sobre el
 * subtotal.
 */
export function impuestos(subtotal, tasaIvaPct, gaPct) {
  const ga = subtotal * (gaPct / 100)
  const iva = (subtotal + ga) * (tasaIvaPct / 100)
  return { ga, iva, total: subtotal + ga + iva }
}

/**
 * Calcula el precio final de venta por unidad y el total del lote.
 * El IVA y el GA ya están dentro del total importado (se aplican al
 * conjunto, no por unidad); el envío y el manipuleo (totales del envío,
 * ya convertidos a la moneda de salida) se reparten entre todas las
 * unidades, y el margen de ganancia se aplica sobre el costo unitario
 * resultante. Devuelve además la ganancia total del lote y la
 * diferencia unitaria frente al precio referencial (positiva cuando el
 * referencial supera al precio final). Con 0 unidades se calcula como
 * si fuera un solo producto.
 */
export function precioFinal(
  totalImportado, envio, manipuleo, unidades, margenPct, referencialUnitario,
) {
  const n = unidades > 0 ? unidades : 1
  const costoUnitario = (totalImportado + envio + manipuleo) / n
  const precioUnitario = costoUnitario * (1 + margenPct / 100)
  const precioTotal = precioUnitario * n
  const gananciaTotal = (precioUnitario - costoUnitario) * n
  return {
    gananciaTotal,
    precioUnitario,
    precioTotal,
    diferencia: referencialUnitario - precioUnitario,
  }
}