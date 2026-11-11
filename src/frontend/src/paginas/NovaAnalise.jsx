import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alerta, Conteudo, ListaVazia, Campo, Cabecalho } from '../componentes/Elementos.jsx'
import { useAvisos } from '../componentes/avisos.js'
import { useDados, useTitulo } from '../hooks.js'
import { analises, mercados, embalagens, produtos, regras } from '../dados.js'
import { regraAplicavel } from '../verificacao.js'
import { formatarData, dataAtual } from '../utils.js'

export function NovaAnalise() {
  useTitulo('Nova análise')

  const { dados, carregando, erro } = useDados(async () => {
    const [listaProdutos, listaVersoes, listaMercados, listaRegras] = await Promise.all([
      produtos.listar(),
      embalagens.listarTodas(),
      mercados.listar(),
      regras.listar(),
    ])
    return { produtos: listaProdutos, versoes: listaVersoes, mercados: listaMercados, regras: listaRegras }
  })

  return (
    <div className="pagina">
      <Cabecalho
        sobretitulo="Verificação"
        titulo="Nova análise"
        descricao="Escolha a embalagem, os mercados de destino e a data de referência. Só entram as regras vigentes nessa data."
      />
      <Conteudo carregando={carregando} erro={erro}>
        {dados &&
          (dados.versoes.length === 0 ? (
            <ListaVazia
              titulo="Nenhuma embalagem para analisar"
              descricao="Cadastre um produto e envie uma versão da embalagem antes de executar uma análise."
              acao={
                <Link to="/products" className="botao botao--pequeno">
                  Ir para produtos
                </Link>
              }
            />
          ) : (
            <FormularioAnalise {...dados} />
          ))}
      </Conteudo>
    </div>
  )
}

function FormularioAnalise({ produtos: listaProdutos, versoes: listaVersoes, mercados: listaMercados, regras: listaRegras }) {
  const navegar = useNavigate()
  const { avisar } = useAvisos()
  const [parametros] = useSearchParams()

  const versaoInicial = listaVersoes.find((versao) => versao.id === parametros.get('version'))
  const [produtoId, setProdutoId] = useState(versaoInicial?.productId ?? '')
  const [versaoId, setVersaoId] = useState(versaoInicial?.id ?? '')
  const [mercadosIds, setMercadosIds] = useState([])
  const [dataReferencia, setDataReferencia] = useState(dataAtual())
  const [erroFormulario, setErroFormulario] = useState('')
  const [analisando, setAnalisando] = useState(false)

  const versoesProduto = listaVersoes
    .filter(versao => versao.productId === produtoId)
    .sort((a, b) => b.number - a.number)
  const produtoSelecionado = listaProdutos.find((produto) => produto.id === produtoId)
  const versaoSelecionada = listaVersoes.find((versao) => versao.id === versaoId)
  const mercadosSelecionados = listaMercados.filter((mercado) => mercadosIds.includes(mercado.id))

  let quantidadeRegras = 0
  if (produtoSelecionado && dataReferencia) {
    for (const mercadoId of mercadosIds) {
      quantidadeRegras += listaRegras.filter(
        regra => regraAplicavel(regra, produtoSelecionado, mercadoId, dataReferencia),
      ).length
    }
  }

  function selecionarProduto(evento) {
    const proximoProdutoId = evento.target.value
    setProdutoId(proximoProdutoId)
    const ultimaVersao = listaVersoes
      .filter((versao) => versao.productId === proximoProdutoId)
      .sort((a, b) => b.number - a.number)[0]
    setVersaoId(ultimaVersao?.id ?? '')
  }

  function alternarMercado(mercadoId) {
    setMercadosIds((atual) =>
      atual.includes(mercadoId) ? atual.filter((id) => id !== mercadoId) : [...atual, mercadoId],
    )
  }

  async function salvarFormulario(evento) {
    evento.preventDefault()
    setErroFormulario('')
    setAnalisando(true)
    try {
      const analise = await analises.executar({ versionId: versaoId, marketIds: mercadosIds, referenceDate: dataReferencia })
      avisar('Análise concluída.')
      navegar(`/analyses/${analise.id}`)
    } catch (erro) {
      setErroFormulario(erro.message)
      setAnalisando(false)
    }
  }

  return (
    <form className="divisao" onSubmit={salvarFormulario} noValidate>
      <div>
        <div className="etapa">
          <span className="etapa__numero">1</span>
          <div className="etapa__conteudo">
            <h2 className="etapa__titulo">Embalagem</h2>
            <div className="pilha">
              <Campo id="product" rotulo="Produto">
                <select
                  id="product"
                  className="select"
                  value={produtoId}
                  onChange={selecionarProduto}
                >
                  <option value="">Selecione…</option>
                  {listaProdutos
                    .filter((produto) => listaVersoes.some((versao) => versao.productId === produto.id))
                    .map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.name}
                      </option>
                    ))}
                </select>
              </Campo>

              <Campo id="version" rotulo="Versão">
                <select
                  id="version"
                  className="select"
                  value={versaoId}
                  onChange={(evento) => setVersaoId(evento.target.value)}
                  disabled={!produtoId}
                >
                  <option value="">Selecione…</option>
                  {versoesProduto.map((versao) => (
                    <option key={versao.id} value={versao.id}>
                      v{versao.number} · {versao.fileName}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            {versaoSelecionada && !versaoSelecionada.extractedText.trim() && (
              <Alerta tom="warning">
                Esta versão não tem texto extraído, então todas as regras terminarão em revisão
                manual. <Link to={`/versions/${versaoSelecionada.id}`}>Revisar o texto</Link>
              </Alerta>
            )}
          </div>
        </div>

        <div className="etapa">
          <span className="etapa__numero">2</span>
          <div className="etapa__conteudo">
            <h2 className="etapa__titulo">Mercados de destino</h2>
            <fieldset className="campos">
              <legend className="apenas-leitor">Mercados de destino</legend>
              <div className="opcoes">
                {listaMercados.map((mercado) => (
                  <label key={mercado.id} className="opcao">
                    <input
                      type="checkbox"
                      className="apenas-leitor"
                      checked={mercadosIds.includes(mercado.id)}
                      onChange={() => alternarMercado(mercado.id)}
                    />
                    {mercado.name}
                    <code>{mercado.code}</code>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="etapa">
          <span className="etapa__numero">3</span>
          <div className="etapa__conteudo">
            <h2 className="etapa__titulo">Data de referência</h2>
            <Campo
              id="referenceDate"
              rotulo="Data de comercialização"
              dica="Define quais regras estão em vigor na análise."
            >
              <input
                id="referenceDate"
                type="date"
                className="input"
                style={{ maxWidth: 260 }}
                value={dataReferencia}
                onChange={(evento) => setDataReferencia(evento.target.value)}
                required
              />
            </Campo>
          </div>
        </div>
      </div>

      <aside className="resumo divisao__lateral" aria-label="Resumo da análise">
        <h2 className="resumo__titulo">Resumo</h2>
        <p className="resumo__subtitulo">Confira antes de executar.</p>
        <div className="resumo__linha-forte" />
        <dl className="resumo__numeros">
          <div className="resumo__numero">
            <dt>Produto</dt>
            <dd>{produtoSelecionado?.name ?? '—'}</dd>
          </div>
          <div className="resumo__numero">
            <dt>Versão</dt>
            <dd>{versaoSelecionada ? `v${versaoSelecionada.number}` : '—'}</dd>
          </div>
          <div className="resumo__numero">
            <dt>Mercados</dt>
            <dd>{mercadosSelecionados.map((mercado) => mercado.code).join(' · ') || '—'}</dd>
          </div>
          <div className="resumo__numero">
            <dt>Referência</dt>
            <dd>{dataReferencia ? formatarData(dataReferencia) : '—'}</dd>
          </div>
          <div className="resumo__numero">
            <dt>Regras aplicáveis</dt>
            <dd className="resumo__valor">{quantidadeRegras}</dd>
          </div>
        </dl>

        <div className="pilha" style={{ padding: '18px 0 14px', gap: 12 }}>
          {erroFormulario && <Alerta tom="error">{erroFormulario}</Alerta>}
          <button type="submit" className="botao botao--bloco" disabled={analisando}>
            {analisando ? 'Analisando…' : 'Executar análise'}
          </button>
        </div>
        <p className="resumo__nota">
          * A análise fica salva no histórico, vinculada a esta versão da embalagem.
        </p>
      </aside>
    </form>
  )
}
