import Button from '../atoms/Button.jsx'
import Divider from '../atoms/Divider.jsx'
import NumberInput from '../atoms/NumberInput.jsx'
import Field from '../molecules/Field.jsx'
import CurrencySelect from '../molecules/CurrencySelect.jsx'
import ResultAmount from '../molecules/ResultAmount.jsx'
import { formatTasa } from '../../utils/number.js'
import { simboloDe } from '../../utils/monedas.js'

/**
 * Organismo: panel izquierdo de la tarjeta de cálculo — lote y
 * impuestos. Los campos se agrupan por relación (monedas juntas
 * entrada → salida, porcentajes juntos) y los resultados van debajo
 * del separador, con el total del lote destacado.
 */
export default function TaxesPanel({ campos, setCampo, factor, impuestos, onReiniciar }) {
  const { monedaEntrada, monedaSalida } = campos
  const simboloSalida = simboloDe(monedaSalida)

  return (
    <section className="grid content-start gap-5" aria-label="Cálculo de impuestos">
      <h2 className="text-base font-semibold text-slate-900">Lote e impuestos</h2>

      {/* Monedas de la conversión, en una sola fila con la tasa aplicada */}
      <div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-2">
          <Field label="Moneda de entrada" htmlFor="moneda-entrada">
            <CurrencySelect
              id="moneda-entrada"
              value={monedaEntrada}
              onChange={(v) => setCampo('monedaEntrada', v)}
            />
          </Field>
          <span aria-hidden="true" className="hidden pb-2.5 text-slate-400 sm:block">→</span>
          <Field label="Moneda de salida" htmlFor="moneda-salida">
            <CurrencySelect
              id="moneda-salida"
              value={monedaSalida}
              onChange={(v) => setCampo('monedaSalida', v)}
            />
          </Field>
        </div>
        {monedaEntrada !== monedaSalida && (
          <p className="mt-1.5 text-right text-xs text-slate-500">
            Tasa: 1 {monedaEntrada} ({simboloDe(monedaEntrada)}) ={' '}
            {formatTasa(factor)} {monedaSalida} ({simboloSalida})
          </p>
        )}
      </div>

      <Field label="Precio base (por unidad)" htmlFor="precio-base">
        <div className="flex gap-2">
          <NumberInput
            id="precio-base"
            className="min-w-0 flex-1"
            value={campos.precioBase}
            onChange={(v) => setCampo('precioBase', v)}
          />
          <div className="w-24 shrink-0">
            <p className="mb-1 text-xs text-slate-500">Unidades</p>
            <NumberInput
              aria-label="Unidades del lote"
              placeholder="0"
              value={campos.unidades}
              onChange={(v) => setCampo('unidades', v)}
            />
          </div>
        </div>
      </Field>

      {/* Los dos tributos comparten fila: son ambos porcentajes */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Tasa de IVA (%)" htmlFor="tasa-iva">
          <NumberInput id="tasa-iva" placeholder="0" value={campos.tasaIva} onChange={(v) => setCampo('tasaIva', v)} />
        </Field>
        <Field label="Gravamen arancelario GA (%)" htmlFor="ga">
          <NumberInput id="ga" placeholder="0" value={campos.ga} onChange={(v) => setCampo('ga', v)} />
        </Field>
      </div>

      {/* Resultados, debajo del separador */}
      <Divider className="my-1" />
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <ResultAmount etiqueta="Impuesto (IVA)" valor={impuestos.iva} simbolo={simboloSalida} />
          <ResultAmount etiqueta="Gravamen (GA)" valor={impuestos.ga} simbolo={simboloSalida} />
        </div>
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <ResultAmount
            etiqueta="Total del lote (base + GA + IVA)"
            valor={impuestos.total}
            simbolo={simboloSalida}
            size="lg"
          />
        </div>
        <Button className="w-full" onClick={onReiniciar}>Reiniciar</Button>
      </div>
    </section>
  )
}