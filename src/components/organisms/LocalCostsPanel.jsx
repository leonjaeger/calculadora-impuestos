import Button from '../atoms/Button.jsx'
import Divider from '../atoms/Divider.jsx'
import NumberInput from '../atoms/NumberInput.jsx'
import Field from '../molecules/Field.jsx'
import CurrencySelect from '../molecules/CurrencySelect.jsx'
import PercentSlider from '../molecules/PercentSlider.jsx'
import DesgloseRow from '../molecules/DesgloseRow.jsx'
import Amount from '../atoms/Amount.jsx'
import { formatMoney } from '../../utils/number.js'
import { MONEDA_REFERENCIAL, simboloDe } from '../../utils/monedas.js'

/**
 * Organismo: panel derecho de la tarjeta de cálculo — costos locales,
 * margen de ganancia y desglose del lote, con la comparación contra el
 * referencial en una caja destacada (misma que el panel izquierdo usa
 * para el total del lote).
 */
export default function LocalCostsPanel({ campos, setCampo, local, onGuardarComo }) {
  const simboloSalida = simboloDe(campos.monedaSalida)
  const simboloReferencial = simboloDe(MONEDA_REFERENCIAL)
  const gananciaPct = Math.round(local.gananciaPct)
  const hayReferencial = local.referencialUnitario > 0
  const aFavor = local.diferencia >= 0

  const comparacion = aFavor
    ? `El referencial unitario supera al precio final en ${formatMoney(local.diferencia, simboloSalida)}.`
    : `El precio final supera al referencial en ${formatMoney(-local.diferencia, simboloSalida)} por unidad.`

  return (
    <section className="grid content-start gap-5" aria-label="Costos locales y ganancia">
      <h2 className="text-base font-semibold text-slate-900">Costos locales y ganancia</h2>

      <PercentSlider id="ganancia-pct" value={campos.gananciaPct} onChange={(v) => setCampo('gananciaPct', v)} />

      {/* El selector de moneda agrupado con los costos logísticos, en una sola fila */}
      <div>
        <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)]">
          <Field label="Moneda" htmlFor="moneda-costos">
            <CurrencySelect
              id="moneda-costos"
              value={campos.monedaCostos}
              onChange={(v) => setCampo('monedaCostos', v)}
            />
          </Field>
          <Field label="Envío" htmlFor="envio">
            <NumberInput id="envio" value={campos.envio} onChange={(v) => setCampo('envio', v)} />
          </Field>
          <Field label="Manipuleo" htmlFor="manipuleo">
            <NumberInput id="manipuleo" value={campos.manipuleo} onChange={(v) => setCampo('manipuleo', v)} />
          </Field>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          La moneda se aplica al envío y el manipuleo; son totales del lote.
        </p>
      </div>

      {/* Referencial y sus unidades con el mismo patrón Field del resto
          de la página. La etiqueta corta evita el salto de línea que
          desalineaba la fila en columnas angostas. */}
      <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] items-end gap-2">
        <Field label={`Precio referencial (${simboloReferencial})`} htmlFor="referencial">
          <NumberInput
            id="referencial"
            value={campos.referencial}
            onChange={(v) => setCampo('referencial', v)}
          />
        </Field>
        <Field label="Unidades" htmlFor="unidades-referencial">
          <NumberInput
            id="unidades-referencial"
            value={campos.referencialUnidades}
            onChange={(v) => setCampo('referencialUnidades', v)}
          />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        El referencial es por unidad; se compara con el precio final unitario.
      </p>

      {/* Desglose del lote */}
      <Divider className="my-1" />
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-slate-900">Desglose</p>
        <DesgloseRow etiqueta="Total importado (base + GA + IVA)" valor={local.totalImportado} simbolo={simboloSalida} />
        <DesgloseRow etiqueta="Envío (total del lote)" valor={local.envio} simbolo={simboloSalida} />
        <DesgloseRow etiqueta="Manipuleo (total del lote)" valor={local.manipuleo} simbolo={simboloSalida} />
        <DesgloseRow etiqueta={`Ganancia (${gananciaPct} %)`} valor={local.gananciaTotal} simbolo={simboloSalida} />
      </div>

      {/* Comparación final vs referencial, en caja destacada */}
      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-slate-500">Precio final</p>
            <Amount valor={local.precioUnitario} simbolo={simboloSalida} size="lg" />
            <p className="mt-1 text-xs text-slate-500">Total</p>
            <Amount valor={local.precioTotal} simbolo={simboloSalida} size="sm" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Precio referencial</p>
            <Amount valor={local.referencialUnitario} simbolo={simboloSalida} size="lg" />
            <p className="mt-1 text-xs text-slate-500">Total</p>
            <Amount valor={local.referencialTotal} simbolo={simboloSalida} size="sm" />
          </div>
        </div>
        {hayReferencial && (
          <>
            <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-500">Diferencia unitaria</p>
              <p className={`text-lg font-semibold tabular-nums ${aFavor ? 'text-hoja' : 'text-carmesi'}`}>
                {(aFavor ? '+' : '-') + formatMoney(Math.abs(local.diferencia), simboloSalida)}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">{comparacion}</p>
          </>
        )}
        {!hayReferencial && (
          <p className="mt-3 text-xs text-slate-500">
            Ingresa un precio referencial para compararlo con el precio final.
          </p>
        )}
      </div>

      <Button className="w-full" onClick={onGuardarComo}>Guardar como</Button>
    </section>
  )
}