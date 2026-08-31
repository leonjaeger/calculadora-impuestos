# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

## Estado de la sesión (2026-08-30)

Réplica web de la app WinUI 3 "Calculadora de impuestos"
(`C:\Users\USUARIO\source\repos\Calculadora de impuestos`), construida
con **Vite + React 19 + Tailwind CSS v4** y estructura de
carpetas por **diseño atómico**. Una sola página: calculadora completa
(panel de impuestos + costos locales). Historial: el 30/8/2026 se
implementó a pedido del cliente la división en 3 secciones (aranceles,
ganancias, blog) y **se revirtió el mismo día** a petición del usuario —
el contenido de esa versión (componentes `SiteNav`/`ArancelesSection`/
`GananciasSection`/`BlogSection`, blog en `src/blog/`,
`utils/markdown.js`, `utils/seo.js` y su artículo demo) queda disponible
en el historial de la conversación si se quiere retomar.

**Prueba de humo ejecutada** (Playwright + Edge msedge, script en
`C:\Users\USUARIO\AppData\Local\Temp\pw-smoke\smoke.mjs`): la página
renderiza, la cotización real del BCB carga (Bs 11,92 por USD, Bs 13,80
por EUR, fecha 2026-08-30), teclear `20,5` con **coma decimal** en la
tasa de IVA produce IVA Bs 20,50 y total Bs 120,50, y no hay errores de
consola. El usuario pidió **no usar imágenes** en esta sesión (no se
revisaron capturas).

## Comandos

```powershell
npm install
npm run dev       # Vite en http://localhost:5173
npm run build     # build de producción en dist/
npm run preview   # sirve dist/
```

## Arquitectura

### Diseño atómico (`src/`)

- `components/atoms/` — Button, NumberInput, Select, Label, Divider,
  Amount (cantidad monetaria formateada).
- `components/molecules/` — Field, CurrencySelect, PercentSlider,
  RateRow, ResultAmount, DesgloseRow, SavedCalcItem, SaveCalcDialog.
- `components/organisms/` — AppHeader, RatesPanel, SavedPanel,
  TaxesPanel, LocalCostsPanel.
- `components/templates/` — MainTemplate (layout responsive; el grid de
  dos columnas se resuelve con breakpoints de Tailwind, sin code-behind).
- `pages/` — CalculatorPage (orquesta hooks + organismos; único lugar
  con lógica de composición).
- `hooks/` — `useBcbRates` (descarga + caché por día + refresco al
  cruzar medianoche cada 60 s), `useSavedCalculations` (localStorage),
  `useCalculator` (estado del formulario; los números se guardan como
  **texto**, no como float).
- `services/` — `bcbCotizaciones.js` (scraping del HTML del BCB,
  caché en `localStorage`).
- `utils/` — `number.js` (parser/formateo anti comas flotantes),
  `calculos.js` (puerto directo de `Calculos.cs`), `monedas.js`.

La lógica de negocio es un puerto fiel de los archivos .cs originales:
`Calculos.cs` → `utils/calculos.js` y `BcbCotizaciones.cs` →
`services/bcbCotizaciones.js`. Los cálculos puros **no** redondean; el
redondeo ocurre solo al mostrar (`roundTo` + `Intl.NumberFormat`).

### El error de las "comas flotantes" y cómo se evita

Bug original (WinUI 3): el XAML convertía `14.94` pasando por `float`
(32 bits) y se mostraba `14.93999958`; además la validación de las
NumberBox dependía de la región (punto vs coma). La web lo evita así:

1. Los inputs numéricos guardan el texto tal cual se teclea
   (`useCalculator`) y se analizan con `parseNumberInput` solo al
   calcular. Acepta coma o punto decimal; cuando aparecen ambos, el
   último es el decimal y el otro agrupa miles (`1.234,56` = `1,234.56`).
2. Todo valor mostrado pasa por `roundTo` (corrección de épsilon
   IEEE-754; `0.1+0.2` → `Bs 0,30`) y `formatMoney`; nunca se imprime un
   float crudo.

### Cotización del BCB (importante) — GitHub Actions, no proxy en ejecución

El BCB no envía CORS y **devuelve 403 si la petición llega con las
cabeceras `Origin`/`Referer` del navegador**; además la cotización
solo cambia una vez al día. La tabla del BCB pasa a marcar el día
siguiente alrededor de las **20:00 de Bolivia (00:00 UTC)** — antes de
la medianoche local (verificado el 30/8/2026: a las 19:34 marcaba el
30, a las 20:22 ya marcaba el 31). El diseño elegido (a pedido del
usuario, descartadas las
variantes Cloudflare Function y Cloud Function de Firebase que exigen
configuración/hosting especial):

- **Una consulta al día en total**, hecha por GitHub Actions
  (`.github/workflows/cotizacion.yml`, cron `10 9 * * *` = 05:10 de
  Bolivia), no por visitas: ejecuta `scripts/actualizar-cotizacion.mjs`,
  que descarga la tabla y escribe `public/cotizacion.json`
  (`{fecha, bsPorUsd, bsPorEur, actualizado}`) con commit solo si
  cambió. El push dispara el despliegue
  (`.github/workflows/deploy.yml` → build + `firebase deploy
  --only hosting` con el secreto `FIREBASE_TOKEN`).
- El navegador consume **el JSON estático del propio sitio**
  (`/cotizacion.json` en build — `import.meta.env.PROD`; `/api/bcb` en
  dev vía middleware de `vite.config.js` con el mismo parser). Estático
  y del mismo origen: sin CORS y sin proxy en ejecución. `VITE_BCB_URL`
  permite apuntar a otro lugar si cambia el hosting.
- Parser compartido puro: `scripts/bcbParse.js` (sin DOMParser ni APIs
  de Workers — corre igual en Node y en el navegador).
- Caché diaria en `localStorage` con clave `calculadora-impuestos:bcb-rates`
  y respaldo en tasas provisionales (11.50 / 13.43) si todo falla.

Notas sacadas al portar el parser (difieren de lo que asumía el .cs):

- El HTML del BCB usa **entidades HTML** (`UNI&Oacute;N EUROPEA`,
  `&nbsp;`); se decodifican con la tabla de entidades de
  `bcbParse.js` y se retira el marcado con regex (antes se usaba
  `DOMParser` en el navegador; hoy el parsing no ocurre en el cliente).
- El formato de fecha actual de la tabla es
  `COTIZACIONES DEL 30 DE AGOSTO DE 2026` (mayúsculas), no
  `FECHA DE COTIZACIÓN: 24 de Agosto 2026`; el extractor acepta ambos.

### Guardados

Los cálculos guardados persisten en `localStorage`
(`calculadora-impuestos:guardados`), equivalentes al `guardados.json`
de la app original. Cada ítem lleva un `id` (`crypto.randomUUID`).
En la web la carga de un guardado es con **un clic** (la app original
usaba doble clic).

El **precio referencial local es siempre en bolivianos** (constante
`MONEDA_REFERENCIAL` en `utils/monedas.js`): no sigue al selector de
moneda de costos del panel derecho, que solo rige envío y manipuleo.
Se convierte por su cuenta (BOB → moneda de salida) con su propio
factor. Pedido del cliente Pox del 30/8/2026.