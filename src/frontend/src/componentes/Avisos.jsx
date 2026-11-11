import { useState } from 'react'
import { ContextoAvisos } from './avisos.js'

const DURACAO_AVISO = 4000

export function Avisos({ children: conteudo }) {
  const [avisos, setAvisos] = useState([])

  function avisar(mensagem, tom = 'success') {
    const id = crypto.randomUUID()
    setAvisos((atual) => [...atual, { id, message: mensagem, tone: tom }])
    setTimeout(
      () => setAvisos((atual) => atual.filter((aviso) => aviso.id !== id)),
      DURACAO_AVISO,
    )
  }

  return (
    <ContextoAvisos.Provider value={{ avisar }}>
      {conteudo}
      <div className="area-avisos" role="status" aria-live="polite">
        {avisos.map((aviso) => (
          <div key={aviso.id} className={`aviso aviso--${aviso.tone}`}>
            {aviso.message}
          </div>
        ))}
      </div>
    </ContextoAvisos.Provider>
  )
}
