// Job diario de la cotización del BCB — lo ejecuta GitHub Actions
// (.github/workflows/cotizacion.yml) una vez al día.
//
// Descarga la tabla de cotizaciones del BCB (una consulta al día en
// total, desde el runner — sin cabeceras de navegador), la parsea con
// el parser compartido y ESCRIBE public/cotizacion.json. Ese archivo
// viaja con el sitio en el despliegue y el navegador lo consume como
// JSON estático del mismo origen (CORS trivial, proxy en ejecución
// innecesario). Si falla la descarga, aborta con exit 1 y el archivo
// del día anterior queda intacto — el sitio distingue por su `fecha`.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { URL_INDICADORES, USER_AGENT, parsearBcb } from './bcbParse.js'

function hoyLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const remota = await fetch(URL_INDICADORES, {
  headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
})
if (!remota.ok) {
  throw new Error(`El BCB respondió ${remota.status} en ${URL_INDICADORES}`)
}

const datos = parsearBcb(await remota.text())
if (!datos || !Number.isFinite(datos.bsPorUsd) || !Number.isFinite(datos.bsPorEur)) {
  throw new Error('El HTML del BCB ya no coincide con el parser — revisar scripts/bcbParse.js')
}

const cuerpo = {
  fecha: datos.fecha ?? hoyLocal(), // la fecha que declara la propia tabla del BCB
  bsPorUsd: datos.bsPorUsd,
  bsPorEur: datos.bsPorEur,
  actualizado: new Date().toISOString(), // en UTC (sufijo Z); Bolivia = UTC−4
}

// Si fecha y tasas no cambiaron, no se toca el archivo: reescribir solo
// `actualizado` generaba un commit (y un despliegue) por corrida sin
// ningún cambio real.
const destino = new URL('../public/cotizacion.json', import.meta.url)
let anterior = null
try {
  anterior = JSON.parse(await readFile(destino, 'utf8'))
} catch {
  // No existe o está dañado: se escribe de nuevo.
}
const resumen = `${cuerpo.fecha} · 1 USD = ${cuerpo.bsPorUsd} BOB · 1 EUR = ${cuerpo.bsPorEur} BOB`
if (anterior?.fecha === cuerpo.fecha
  && anterior?.bsPorUsd === cuerpo.bsPorUsd
  && anterior?.bsPorEur === cuerpo.bsPorEur) {
  // Sin process.exit(): en Windows abortaba con la conexión del fetch
  // aún abierta (assert de libuv). El script termina solo.
  console.log(`Sin cambios: ${resumen}`)
} else {
  await mkdir(new URL('../public', import.meta.url), { recursive: true })
  await writeFile(destino, JSON.stringify(cuerpo, null, 2) + '\n')
  console.log(`Cotización escrita: ${resumen}`)
}