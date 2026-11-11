import { createContext, useContext } from 'react'

export const ContextoAvisos = createContext(null)

export function useAvisos() {
  const contexto = useContext(ContextoAvisos)
  if (!contexto) throw new Error('useAvisos deve ser usado dentro de Avisos.')
  return contexto
}
