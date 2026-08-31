/**
 * Organismo: encabezado de la página.
 */
export default function AppHeader() {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold text-slate-900">Calculadora de impuestos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Calcula el IVA y el total a partir de un precio base, convierte entre
        monedas y compara con un precio referencial local.
      </p>
    </header>
  )
}