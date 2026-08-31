import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { URL_INDICADORES, USER_AGENT, parsearBcb } from './scripts/bcbParse.js'

// El BCB no envía cabeceras CORS, por lo que el navegador no puede
// pedir la tabla directamente. En producción la consulta NO hace el
// navegador: GitHub Actions la hace una vez al día (ver
// .github/workflows/cotizacion.yml) y escribe public/cotizacion.json,
// que el sitio sirve como archivo estático y queda en el mismo origen.
//   - Desarrollo: el middleware de abajo conserva la consulta en vivo
//     con el MISMO parser (scripts/bcbParse.js). El BCB rechaza con
//     403 las peticiones con Origin/Referer; aquí la descarga sale de
//     Node sin esas cabeceras, con User-Agent propio.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-bcb-dev',
      configureServer(servidor) {
        servidor.middlewares.use('/api/bcb', async (_req, res) => {
          try {
            const remota = await fetch(URL_INDICADORES, {
              headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
            })
            const datos = remota.ok ? parsearBcb(await remota.text()) : null
            if (!datos) throw new Error(`BCB respondió ${remota.status} o el HTML no coincide`)
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              fecha: datos.fecha ?? new Date().toISOString().slice(0, 10),
              bsPorUsd: datos.bsPorUsd,
              bsPorEur: datos.bsPorEur,
              actualizado: new Date().toISOString(),
            }))
          } catch (error) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'No fue posible obtener la cotización del BCB', detalle: String(error) }))
          }
        })
      },
    },
  ],
})