import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alerta, Conteudo, ListaVazia, Cabecalho } from '../componentes/Elementos.jsx'
import { SeloClassificacao, ResumoAnalise } from '../componentes/Indicadores.jsx'
import { useDados, useTitulo } from '../hooks.js'
import { analises, mercados, embalagens, produtos, regras } from '../dados.js'
import { contarClassificacoes, indexarPorId, formatarData, formatarDataHora } from '../utils.js'

const NOTA_RESULTADOS =
  "* Aprovado indica apenas que a regra verificada foi atendida com base no texto informado. Não é certificação nem garantia jurídica de comercialização."

export function ResultadoAnalise() {
  const { id } = useParams()

  const { dados, carregando, erro } = useDados(async () => {
    const analise = await analises.buscar(id)
    const [produto, versao, listaMercados, listaRegras] = await Promise.all([
      produtos.buscar(analise.productId).catch(() => null),
      embalagens.buscar(analise.versionId).catch(() => null),
      mercados.listar(),
      regras.listar(),
    ])
    return { analise, produto, versao, mercados: indexarPorId(listaMercados), regras: indexarPorId(listaRegras) }
  }, [id])

  useTitulo(dados?.produto ? `Análise · ${dados.produto.name}` : 'Análise')

  return (
    <div className="pagina">
      <Conteudo carregando={carregando} erro={erro}>
        {dados && <Resultado {...dados} />}
      </Conteudo>
    </div>
  )
}

function Resultado({ analise, produto, versao, mercados: listaMercados, regras: listaRegras }) {
  const [filtroClassificacao, setFiltroClassificacao] = useState('')
  const [filtroMercado, setFiltroMercado] = useState('')

  const contagens = contarClassificacoes(analise.findings)

  const grupos = analise.marketIds
    .filter((mercadoId) => !filtroMercado || mercadoId === filtroMercado)
    .map((mercadoId) => ({
      marketId: mercadoId,
      findings: analise.findings.filter(
        (achado) =>
          achado.marketId === mercadoId &&
          (!filtroClassificacao || achado.classification === filtroClassificacao),
      ),
    }))
    .filter((grupo) => grupo.findings.length > 0)

  const mercadosSemRegras = analise.marketIds.filter(
    (mercadoId) => !analise.findings.some((achado) => achado.marketId === mercadoId),
  )

  return (
    <>
      <Cabecalho
        sobretitulo={`Análise · ${formatarDataHora(analise.createdAt)}`}
        titulo={analise.productName ?? produto?.name ?? 'Produto removido'}
        descricao={`Versão v${versao?.number ?? '?'} · referência em ${formatarData(analise.referenceDate)}`}
        acoes={
          <>
            <Link to="/analyses" className="acao">
              Histórico
            </Link>
            {versao && (
              <Link to={`/analyses/new?version=${versao.id}`} className="botao">
                Nova análise
              </Link>
            )}
          </>
        }
      />

      <div className="divisao">
        <div className="pilha" style={{ gap: 36 }}>
          {mercadosSemRegras.length > 0 && (
            <Alerta tom="warning">
              Nenhuma regra vigente foi encontrada para{' '}
              {mercadosSemRegras.map((mercadoId) => listaMercados[mercadoId]?.name).join(', ')} nessa data
              e categoria. Considere uma revisão manual.
            </Alerta>
          )}

          {analise.marketIds.length > 1 && (
            <div className="abas-filtro" role="group" aria-label="Filtrar por mercado">
              <button
                type="button"
                className="aba-filtro"
                aria-pressed={filtroMercado === ''}
                onClick={() => setFiltroMercado('')}
              >
                Todos os mercados
              </button>
              {analise.marketIds.map((mercadoId) => (
                <button
                  key={mercadoId}
                  type="button"
                  className="aba-filtro"
                  aria-pressed={filtroMercado === mercadoId}
                  onClick={() => setFiltroMercado(mercadoId)}
                >
                  {listaMercados[mercadoId]?.name}
                </button>
              ))}
            </div>
          )}

          {grupos.length === 0 ? (
            <ListaVazia
              titulo="Nenhum resultado para mostrar"
              descricao="Não há verificações com esse filtro."
            />
          ) : (
            grupos.map((grupo) => (
              <section key={grupo.marketId} className="grupo-mercado">
                <div className="grupo-mercado__titulo">
                  <h2>{listaMercados[grupo.marketId]?.name}</h2>
                  <span className="code">{listaMercados[grupo.marketId]?.code}</span>
                </div>
                <ul className="registros">
                  {grupo.findings.map((achado) => {
                    const regra = listaRegras[achado.ruleId]
                    return (
                      <li key={achado.id} className="achado">
                        <SeloClassificacao classificacao={achado.classification} />
                        <div className="achado__conteudo">
                          <h3>{achado.ruleTitle ?? regra?.title ?? 'Regra removida'}</h3>
                          <p className="suave">{achado.explanation}</p>
                          {(achado.source ?? regra?.source) && (
                            <p className="achado__fonte">{achado.source ?? regra.source}</p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))
          )}
        </div>

        <div className="divisao__lateral">
          <ResumoAnalise
            titulo="Resumo das análises"
            subtitulo={`${analise.findings.length} verificações · filtre por resultado`}
            contagens={contagens}
            selecionado={filtroClassificacao}
            aoSelecionar={setFiltroClassificacao}
            nota={NOTA_RESULTADOS}
          />
        </div>
      </div>
    </>
  )
}
