import { useEffect, useRef, useState } from 'react'

export function useDados(carregar, dependencias = []) {
  const [resultado, setResultado] = useState({ chave: '', dados: null, erro: null })
  const [tentativa, setTentativa] = useState(0)
  const tarefa = useRef(carregar)
  const chave = JSON.stringify([dependencias, tentativa])

  useEffect(() => {
    tarefa.current = carregar
  })

  useEffect(() => {
    let ativo = true

    async function buscarDados() {
      try {
        const dados = await tarefa.current()
        if (ativo) setResultado({ chave, dados, erro: null })
      } catch (erro) {
        if (ativo) setResultado({ chave, dados: null, erro: erro.message })
      }
    }

    buscarDados()
    return () => { ativo = false }
  }, [chave])

  const carregando = resultado.chave !== chave
  return {
    dados: carregando ? null : resultado.dados,
    erro: carregando ? null : resultado.erro,
    carregando,
    recarregar: () => setTentativa(atual => atual + 1),
  }
}

export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? titulo + ' · PackRule' : 'PackRule'
  }, [titulo])
}
