import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Conteudo, Confirmacao, ListaVazia, Cabecalho } from '../componentes/Elementos.jsx'
import { SeloClassificacao } from '../componentes/Indicadores.jsx'
import { useAvisos } from '../componentes/avisos.js'
import { useDados, useTitulo } from '../hooks.js'
import { regraVigente } from '../verificacao.js'
import { mercados, regras } from '../dados.js'
import { TODAS_CATEGORIAS, TIPOS_REGRA } from '../config.js'
import { formatarData, pluralizar, dataAtual } from '../utils.js'

function situacaoRegra(regra, hoje) {
  if (regra.startDate > hoje) return 'Futura'
  return regraVigente(regra, hoje) ? 'Vigente' : 'Encerrada'
}

export function Regras() {
  useTitulo('Regras')
  const { avisar } = useAvisos()
  const [filtroMercado, setFiltroMercado] = useState('')
  const [regraExcluir, setRegraExcluir] = useState(null)
  const hoje = dataAtual()

  const { dados, carregando, erro, recarregar } = useDados(async () => {
    const [listaRegras, listaMercados] = await Promise.all([regras.listar(), mercados.listar()])
    return { regras: listaRegras, mercados: listaMercados }
  })

  const filtrados = dados?.regras.filter(
    regra => !filtroMercado || regra.marketIds.includes(filtroMercado),
  ) ?? []

  async function excluir() {
    try {
      await regras.excluir(regraExcluir.id)
      avisar('Regra excluída.')
      recarregar()
    } catch (erro) {
      avisar(erro.message, 'error')
    }
    setRegraExcluir(null)
  }

  return (
    <div className="pagina">
      <Cabecalho
        sobretitulo={dados ? pluralizar(dados.regras.length, 'regra', 'regras') : 'Base de conhecimento'}
        titulo="Regras de conformidade"
        descricao="Organize os critérios que a análise aplica a cada mercado, categoria e período de vigência."
        acoes={
          <Link to="/rules/new" className="botao">
            Nova regra
          </Link>
        }
      />

      <Conteudo carregando={carregando} erro={erro}>
        {dados && (
          <section className="secao">
            <div className="abas-filtro" role="group" aria-label="Filtrar por mercado">
              <button
                type="button"
                className="aba-filtro"
                aria-pressed={filtroMercado === ''}
                onClick={() => setFiltroMercado('')}
              >
                Todos
              </button>
              {dados.mercados.map((mercado) => (
                <button
                  key={mercado.id}
                  type="button"
                  className="aba-filtro"
                  aria-pressed={filtroMercado === mercado.id}
                  onClick={() => setFiltroMercado(mercado.id)}
                >
                  {mercado.name}
                </button>
              ))}
            </div>

            {filtrados.length === 0 ? (
              <ListaVazia
                titulo="Nenhuma regra encontrada"
                descricao="Cadastre uma regra ou altere o filtro de mercado."
              />
            ) : (
              <ul className="registros">
                {filtrados.map((regra) => (
                  <li key={regra.id} className="registro">
                    <div>
                      <Link
                        to={`/rules/${regra.id}/edit`}
                        className="registro__titulo"
                        style={{ textDecoration: 'none' }}
                      >
                        {regra.title}
                      </Link>
                      <p className="registro__detalhes">
                        {TIPOS_REGRA[regra.type].label} ·{' '}
                        {regra.category === TODAS_CATEGORIAS ? 'Todas as categorias' : regra.category} ·{' '}
                        {situacaoRegra(regra, hoje)} desde {formatarData(regra.startDate)}
                        {regra.endDate && ` até ${formatarData(regra.endDate)}`}
                      </p>
                      <p className="registro__detalhes">{regra.source}</p>
                    </div>
                    <div className="registro__lateral">
                      <div className="grupo" style={{ gap: 6 }}>
                        {regra.marketIds.map((mercadoId) => (
                          <span key={mercadoId} className="code">
                            {dados.mercados.find((mercado) => mercado.id === mercadoId)?.code}
                          </span>
                        ))}
                      </div>
                      <SeloClassificacao classificacao={regra.severity} />
                      <Link to={`/rules/${regra.id}/edit`} className="acao">
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="acao acao--perigo"
                        onClick={() => setRegraExcluir(regra)}
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </Conteudo>

      <Confirmacao
        aberto={Boolean(regraExcluir)}
        titulo="Excluir regra?"
        mensagem={`“${regraExcluir?.title ?? ''}” deixará de ser usada em novas análises. Análises anteriores continuam no histórico.`}
        textoConfirmar="Excluir regra"
        aoConfirmar={excluir}
        aoCancelar={() => setRegraExcluir(null)}
      />
    </div>
  )
}
