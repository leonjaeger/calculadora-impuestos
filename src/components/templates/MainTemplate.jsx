/**
 * Plantilla: distribución responsive de la página.
 *
 * Reproduce el layout de la app original: panel de tasas y guardados a
 * la izquierda (240 px) y la tarjeta de cálculo a la derecha; en
 * pantallas estrechas todo se apila en una sola columna. La tarjeta de
 * cálculo se divide a su vez en dos columnas (impuestos | costos
 * locales) cuando hay espacio, con Tailwind breakpoints en lugar del
 * code-behind de la app WinUI 3.
 */
export default function MainTemplate({ header, lateral, calculadora }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {header}
        <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="grid w-full gap-4 lg:w-60">{lateral}</aside>
          <main className="min-w-0">{calculadora}</main>
        </div>
      </div>
    </div>
  )
}