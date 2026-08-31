import { useState } from 'react'

const CLAVE = 'calculadora-impuestos:guardados'

/**
 * Lee los cálculos guardados del localStorage (equivalente al
 * guardados.json de la app original). Si no existe o está dañado, se
 * arranca con la lista vacía.
 */
function leerGuardados() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(datos) ? datos : []
  } catch {
    return []
  }
}

/**
 * Cálculos guardados por el usuario (valores del panel de costos
 * locales). Se guardan tal como se capturaron (con su moneda original),
 * de modo que al recargarlos el tipo de cambio vigente del BCB sigue
 * aplicándose de forma dinámica.
 */
export function useSavedCalculations() {
  const [guardados, setGuardados] = useState(leerGuardados)

  const persistir = (lista) => {
    setGuardados(lista)
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lista, null, 2))
    } catch {
      // Sin almacenamiento disponible: los guardados valen solo para
      // esta sesión.
    }
  }

  const agregar = (item) => {
    persistir([...guardados, { ...item, id: crypto.randomUUID() }])
  }

  const eliminar = (id) => {
    persistir(guardados.filter((g) => g.id !== id))
  }

  return { guardados, agregar, eliminar }
}