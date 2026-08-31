# Calculadora de impuestos — Web

Réplica web (Vite + React 19 + Tailwind CSS v4) de la app de escritorio
WinUI 3 "Calculadora de impuestos", con estructura de carpetas por
**diseño atómico**.

Calcula el IVA y el gravamen arancelario (GA) sobre un lote, convierte
entre USD / EUR / BOB con la **cotización oficial diaria del Banco
Central de Bolivia (BCB)**, y compara un precio final de venta (con
envío, manipuleo y margen de ganancia) contra un precio referencial
local.

## Uso

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # producción en dist/
```

## Corrección del error de las "comas flotantes"

La app original mostraba artefactos como `14.93999958` (el XAML
convertía `14.94` pasando por `float` de 32 bits) y dependía de la
región para aceptar punto o coma decimal. Aquí se evita por diseño:

- **Los campos numéricos guardan texto**, nunca un float intermedio.
  El análisis ocurre solo al calcular, con un parser que acepta
  indistintamente `14,94` y `14.94`, y desambigua miles cuando
  aparecen ambos separadores (`1.234,56` = `1,234.56`).
- **Nada se imprime crudo**: todo número mostrado pasa por
  `roundTo` (con corrección del épsilon IEEE-754) y un formateador a 2
  decimales — `0.1 + 0.2` se muestra `Bs 0,30`, no `0.30000000000000004`.
- Los cálculos puros (`src/utils/calculos.js`) no redondean; el
  redondeo es solo de presentación, para no acumular error.

Ver `src/utils/number.js` para los detalles.

## Tipo de cambio del BCB

La cotización **no se consulta desde el navegador**: la tabla del BCB
no envía CORS y responde 403 a peticiones con `Origin`/`Referer`. La
consulta la hace **GitHub Actions una vez al día**
(`.github/workflows/cotizacion.yml`, cron a las 05:10 de Bolivia), con
el parser compartido (`scripts/bcbParse.js`), y **escribe
`public/cotizacion.json`** — un archivo estático del propio sitio, con
`{fecha, bsPorUsd, bsPorEur, actualizado}`, que el navegador consume
del mismo origen (sin CORS ni proxy en ejecución).

- El navegador usa su propio JSON del archivo y además cachea la
  cotización del día en `localStorage`: la mayoría de las navegaciones
  no generan ninguna petición nueva.
- Si el BCB no publicó nada nuevo, el job no hace commit y el sitio
  conserva el archivo anterior (su campo `fecha` lo hace visible).
- Si todo falla, se usan tasas provisionales de respaldo
  (`COTIZACION_PROVISIONAL`).
- En **desarrollo** sigue habiendo una consulta en vivo: el middleware
  de Vite (`vite.config.js`) sirve `/api/bcb` con el mismo parser.

## Despliegue (Firebase Hosting)

```powershell
npm i -g firebase-tools
firebase login
firebase use <ID-del-proyecto>     # crea .firebaserc
firebase deploy --only hosting     # pública dist/
```

O bien por CI: el workflow `.github/workflows/deploy.yml` construye y
publica con cada push (necesita el secreto `FIREBASE_TOKEN`, generado
con `firebase login:ci`, y `.firebaserc` con el ID del proyecto — que
no se versiona aquí). El bot de la cotización no necesita ningún
secreto: solo permiso de commit en el repo.

El parser vive en `functions/api/_lib/bcbParse.js` (módulo puro, sin
APIs de navegador) y lo usan los dos entornos:

- **Desarrollo**: middleware de Vite (`vite.config.js`), que descarga
  la tabla en Node — sin `Origin`/`Referer`, que el BCB rechazan con
  403 — y sirve el mismo JSON.
- **Producción** (Cloudflare Pages): `functions/api/bcb.js` — Pages
  Function servida junto con el sitio. La cotización cambia una vez al
  día, así que el BCB se consulta **una vez al día en total**, no por
  visitante: la caché se guarda bajo la fecha del día (Bolivia, UTC−4),
  sirve el último JSON válido si el BCB falla y responde 502 si no hay
  respaldo.

Adicionalmente, cada navegador cachea la cotización del día en
`localStorage` y consulta el endpoint como máximo una vez por día; si
todo falla, se usan tasas provisionales de respaldo
(`COTIZACION_PROVISIONAL`).

## Estructura (diseño atómico)

```
src/
├── components/
│   ├── atoms/        # Button, NumberInput, Select, Label, Divider, Amount
│   ├── molecules/    # Field, CurrencySelect, PercentSlider, RateRow,
│   │                 # ResultAmount, DesgloseRow, SavedCalcItem,
│   │                 # SaveCalcDialog
│   ├── organisms/    # AppHeader, RatesPanel, SavedPanel, TaxesPanel,
│   │                 # LocalCostsPanel
│   └── templates/    # MainTemplate (layout responsive)
├── pages/            # CalculatorPage (composición)
├── hooks/            # useBcbRates, useSavedCalculations, useCalculator
├── services/         # bcbCotizaciones (consumo del JSON diario + caché local)
└── utils/            # number (parser/formateo), calculos, monedas

scripts/
├── bcbParse.js               # parser del HTML del BCB (puro, sin browser)
└── actualizar-cotizacion.mjs # job diario: BCB → public/cotizacion.json

.github/workflows/
├── cotizacion.yml    # 1 vez al día: consulta al BCB + commit del JSON
└── deploy.yml        # cada push: build + deploy a Firebase Hosting
```