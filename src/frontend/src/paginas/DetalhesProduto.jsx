import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Conteudo, Confirmacao, ListaVazia, Cabecalho } from '../componentes/Elementos.jsx'
import { BarraCores } from '../componentes/Indicadores.jsx'
import { useAvisos } from '../componentes/avisos.js'
import { useDados, useTitulo } from '../hooks.js'
import { analises, embalagens, produtos } from '../dados.js'
import { contarClassificacoes, formatarData, formatarDataHora, formatarTamanho } from '../utils.js'

export function DetalhesProduto() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { avisar } = useAvisos()
  const [confirmacao, setConfirmacao] = useState(null)

  const { dados, carregando, erro, recarregar } = useDados(async () => {
    const [produto, listaVersoes, listaAnalises] = await Promise.all([
      produtos.buscar(id),
      embalagens.listarPorProduto(id),
      analises.listar(),
    ])
    return { produto, versoes: listaVersoes, analises: listaAnalises.filter((a) => a.productId === id) }
  }, [id])

  useTitulo(dados?.produto.name ?? 'Produto')

  async function confirmarExclusao() {
    const acao = confirmacao
    setConfirmacao(null)
    try {
      if (acao.tipo === 'produto') {
        await produtos.excluir(id)
        avisar('Produto excluído.')
        navegar('/products')
        return
      }
      await embalagens.excluir(acao.versao.id)
      avisar('Versão excluída.')
      recarregar()
    } catch (erro) {
      avisar(erro.message, 'error')
    }
  }

  return (
    <div className="pagina">
      <Conteudo carregando={carregando} erro={erro}>
        {dados && (
          <>
            <Cabecalho
              sobretitulo={dados.produto.category}
              titulo={dados.produto.name}
              descricao={dados.produto.description || undefined}
              acoes={
                <>
                  <Link to={`/products/${id}/edit`} className="acao">
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="acao acao--perigo"
                    onClick={() => setConfirmacao({ tipo: 'produto' })}
                  >
                    Excluir
                  </button>
                </>
              }
            />

            <section className="secao" aria-labelledby="versions-title">
              <div className="secao__cabecalho">
                <div className="secao__texto">
                  <h2 id="versions-title">Versões da embalagem</h2>
                  <p className="secao__descricao">Cada nova arte fica em uma versão própria, sem substituir as anteriores.</p>
                </div>
                <Link to={`/products/${id}/versions/new`} className="botao botao--contorno botao--pequeno">
                  Nova versão
                </Link>
              </div>

              {dados.versoes.length === 0 ? (
                <ListaVazia
                  titulo="Nenhuma embalagem enviada"
                  descricao="Envie o arquivo da embalagem em PDF, PNG ou JPG para poder analisá-la."
                />
              ) : (
                <ul className="registros">
                  {dados.versoes.map((versao) => (
                    <li key={versao.id} className="registro-versao">
                      <span className="numero-versao">v{versao.number}</span>
                      <div>
                        <Link
                          to={`/versions/${versao.id}`}
                          className="registro__titulo"
                          style={{ textDecoration: 'none' }}
                        >
                          {versao.fileName}
                        </Link>
                        <p className="registro__detalhes">
                          {formatarDataHora(versao.uploadedAt)} · {formatarTamanho(versao.fileSize)}
                          {versao.material && ` · ${versao.material}`}
                        </p>
                        <p className="registro-versao__trecho">
                          {versao.extractedText ||
                            "Sem texto extraído. A análise indicará Revisão manual."}
                        </p>
                      </div>
                      <div className="registro-versao__acoes">
                        <Link to={`/analyses/new?version=${versao.id}`} className="botao botao--pequeno">
                          Analisar
                        </Link>
                        <button
                          type="button"
                          className="acao acao--perigo"
                          onClick={() => setConfirmacao({ tipo: 'versao', versao })}
                        >
                          Excluir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="secao" aria-labelledby="analyses-title">
              <div className="secao__cabecalho">
                <div className="secao__texto">
                  <h2 id="analyses-title">Análises realizadas</h2>
                  <p className="secao__descricao">Consulte os resultados de cada versão e a data usada na verificação.</p>
                </div>
              </div>
              {dados.analises.length === 0 ? (
                <ListaVazia
                  titulo="Nenhuma análise ainda"
                  descricao="As análises executadas para este produto aparecerão aqui."
                />
              ) : (
                <ul className="registros">
                  {dados.analises.map((analise) => {
                    const versao = dados.versoes.find((v) => v.id === analise.versionId)
                    return (
                      <li key={analise.id}>
                        <Link to={`/analyses/${analise.id}`} className="registro registro--link">
                          <div>
                            <p className="registro__titulo">
                              Versão v{versao?.number ?? '?'} · referência{' '}
                              {formatarData(analise.referenceDate)}
                            </p>
                            <p className="registro__detalhes">{formatarDataHora(analise.createdAt)}</p>
                          </div>
                          <div className="registro__lateral" style={{ width: 150 }}>
                            <div style={{ flex: 1 }}>
                              <BarraCores contagens={contarClassificacoes(analise.findings)} />
                            </div>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </Conteudo>

      <Confirmacao
        aberto={Boolean(confirmacao)}
        titulo={confirmacao?.tipo === 'produto' ? 'Excluir produto?' : 'Excluir versão?'}
        mensagem={
          confirmacao?.tipo === 'produto'
            ? 'O produto será excluído com todas as versões de embalagem e análises. Essa ação não pode ser desfeita.'
            : 'A versão e as análises feitas sobre ela serão excluídas. Essa ação não pode ser desfeita.'
        }
        textoConfirmar="Excluir"
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setConfirmacao(null)}
      />
    </div>
  )
}
