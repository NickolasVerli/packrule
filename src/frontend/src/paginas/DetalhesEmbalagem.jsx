import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alerta, Conteudo, Campo, Cabecalho } from '../componentes/Elementos.jsx'
import { useAvisos } from '../componentes/avisos.js'
import { useDados, useTitulo } from '../hooks.js'
import { embalagens, produtos } from '../dados.js'
import { formatarDataHora, formatarTamanho } from '../utils.js'

export function DetalhesEmbalagem() {
  const { id } = useParams()
  const { dados, carregando, erro } = useDados(async () => {
    const versao = await embalagens.buscar(id)
    const produto = await produtos.buscar(versao.productId)
    return { versao, produto }
  }, [id])

  useTitulo(dados ? `${dados.produto.name} v${dados.versao.number}` : 'Embalagem')

  return (
    <div className="pagina">
      <Conteudo carregando={carregando} erro={erro}>
        {dados && (
          <>
            <Cabecalho
              sobretitulo={dados.produto.name}
              titulo={`Versão v${dados.versao.number}`}
              descricao={dados.versao.fileName}
              acoes={
                <>
                  <a href={embalagens.enderecoArquivo(dados.versao.id)} className="acao">
                    Baixar arquivo
                  </a>
                  <Link to={`/products/${dados.produto.id}`} className="acao">
                    Voltar ao produto
                  </Link>
                  <Link to={`/analyses/new?version=${dados.versao.id}`} className="botao">
                    Analisar esta versão
                  </Link>
                </>
              }
            />

            <dl className="informacoes">
              <div>
                <dt>Enviado em</dt>
                <dd>{formatarDataHora(dados.versao.uploadedAt)}</dd>
              </div>
              <div>
                <dt>Arquivo</dt>
                <dd>
                  {dados.versao.fileName} · {formatarTamanho(dados.versao.fileSize)}
                </dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>{dados.versao.material || '—'}</dd>
              </div>
              <div>
                <dt>Quantidade declarada</dt>
                <dd>{dados.versao.declaredQuantity || '—'}</dd>
              </div>
            </dl>

            <RevisaoTexto versao={dados.versao} />
          </>
        )}
      </Conteudo>
    </div>
  )
}

function RevisaoTexto({ versao }) {
  const { avisar } = useAvisos()
  const [texto, setTexto] = useState(versao.extractedText)
  const [salvando, setSalvando] = useState(false)
  const [erroFormulario, setErroFormulario] = useState('')

  async function salvarFormulario(evento) {
    evento.preventDefault()
    setSalvando(true)
    setErroFormulario('')
    try {
      await embalagens.atualizarTexto(versao.id, texto)
      avisar('Texto da embalagem atualizado.')
    } catch (erro) {
      setErroFormulario(erro.message)
    }
    setSalvando(false)
  }

  return (
    <form className="formulario" onSubmit={salvarFormulario}>
      <h2>Revisão do texto extraído</h2>
      {erroFormulario && <Alerta tom="error">{erroFormulario}</Alerta>}
      {!texto.trim() && (
        <Alerta tom="warning">
          {versao.extractionMessage ?? 'Sem texto, todas as regras desta versão terminam em Revisão manual.'}
        </Alerta>
      )}
      <Campo
        id="text"
        rotulo="Texto da embalagem"
        dica="Corrija ou complete o texto antes de executar uma nova análise."
      >
        <textarea
          id="text"
          className="textarea textarea--mono"
          rows={10}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
      </Campo>
      <div className="acoes-formulario">
        <button type="submit" className="botao botao--contorno" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar texto'}
        </button>
      </div>
    </form>
  )
}
