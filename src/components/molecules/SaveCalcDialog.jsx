import { useEffect, useState } from 'react'
import Button from '../atoms/Button.jsx'
import Label from '../atoms/Label.jsx'

/**
 * Molécula: diálogo modal "Guardar como" (equivalente al ContentDialog
 * de la app original). Pide un nombre; si queda vacío se usa el
 * marcador de posición (fecha y hora del momento).
 */
export default function SaveCalcDialog({ abierto, nombreSugerido, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    if (abierto) setNombre('')
  }, [abierto])

  if (!abierto) return null

  const confirmar = () => {
    onGuardar(nombre.trim() || nombreSugerido)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancelar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Guardar como"
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">Guardar como</h2>
        <Label htmlFor="nombre-calculo">Nombre del cálculo</Label>
        <input
          id="nombre-calculo"
          autoFocus
          className="card-input mt-1.5"
          value={nombre}
          placeholder={nombreSugerido}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmar()
            if (e.key === 'Escape') onCancelar()
          }}
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancelar}>Cancelar</Button>
          <Button variant="primary" onClick={confirmar}>Guardar</Button>
        </div>
      </div>
    </div>
  )
}