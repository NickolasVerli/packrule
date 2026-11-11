import { Link } from 'react-router-dom'
import { BarraCores, ResumoAnalise } from '../componentes/Indicadores.jsx'
import { Icone } from '../componentes/Icone.jsx'
import { GuiaSecoes } from '../componentes/GuiaSecoes.jsx'
import { MERCADOS_SUPORTADOS } from '../config.js'
import { useDados, useTitulo } from '../hooks.js'
import { analises, mercados, produtos, regras } from '../dados.js'
import { regraVigente } from '../verificacao.js'
import { contarClassificacoes, indexarPorId, formatarDataHora, pluralizar, dataAtual } from '../utils.js'

const NOTA_RESULTADOS =
  "* Resultados acumulados de todas as análises. Aprovado indica apenas que a regra verificada foi atendida; não é certificação nem garantia jurídica."

const DADOS_PAINEL_VAZIO = {
  produtos: {},
  regras: [],
  analises: [],
  mercados: MERCADOS_SUPORTADOS,
}

export function Painel() {
  useTitulo()

  const { dados, carregando, erro, recarregar } = useDados(async () => {
    const [listaProdutos, listaRegras, listaAnalises, listaMercados] = await Promise.all([
      produtos.listar(),
      regras.listar(),
      analises.listar(),
      mercados.listar(),
    ])
    return { produtos: indexarPorId(listaProdutos), regras: listaRegras, analises: listaAnalises, mercados: listaMercados }
  })

  const dadosPainel = dados ?? DADOS_PAINEL_VAZIO
  const achados = dadosPainel.analises.flatMap((analise) => analise.findings)
  const hoje = dataAtual()
  const regrasVigentes = dadosPainel.regras.filter((regra) => regraVigente(regra, hoje))
  const mensagemAnalises = carregando
    ? 'Carregando as análises recentes…'
    : erro
      ? 'As análises recentes aparecerão quando a conexão for restabelecida.'
      : 'Nenhuma análise executada ainda. Comece cadastrando um produto e enviando sua embalagem.'

  return (
    <div className="pagina">
      <section className="destaque">
        <div className="destaque__texto">
          <p className="sobretitulo">Pré-verificação de embalagens</p>
          <h1 className="destaque__titulo">O que revisar antes de vender neste mercado?</h1>
          <p className="destaque__descricao">
            Cruze produto, embalagem, mercado e data. O PackRule mostra quais regras se aplicam e o
            que precisa mudar antes da impressão.
          </p>
          <div className="grupo" style={{ gap: 28 }}>
            <Link to="/analyses/new" className="botao">
              Nova análise
            </Link>
            <Link to="/products" className="link-seta">
              Ver produtos <Icone nome="arrow" tamanho={16} />
            </Link>
          </div>
        </div>

        <ResumoAnalise
          titulo="Resumo das análises"
          subtitulo={
            carregando
              ? 'Carregando…'
              : erro
                ? 'Dados temporariamente indisponíveis'
                : `${pluralizar(dadosPainel.analises.length, 'análise', 'análises')} · ${pluralizar(achados.length, 'verificação', 'verificações')}`
          }
          contagens={contarClassificacoes(achados)}
          nota={NOTA_RESULTADOS}
        />
      </section>

      <div className="painel__resumo">
        {carregando && (
          <p className="painel__carregamento" role="status">Carregando os dados do painel…</p>
        )}
        {erro && (
          <div className="alerta painel__aviso" role="status">
            <p>{erro} Os totais de produtos, regras e análises aparecem zerados.</p>
            <button type="button" className="acao" onClick={recarregar}>Tentar novamente</button>
          </div>
        )}
        <VisaoGeral
          quantidadeProdutos={Object.keys(dadosPainel.produtos).length}
          quantidadeRegras={regrasVigentes.length}
          quantidadeMercados={dadosPainel.mercados.length}
        />
      </div>

      <div className="duas-colunas">
        <section className="secao" aria-labelledby="recent-title">
          <div className="secao__cabecalho">
            <div className="secao__texto">
              <h2 id="recent-title">Análises recentes</h2>
              <p className="secao__descricao">Retome as últimas verificações e veja o que precisa de atenção.</p>
            </div>
            <Link to="/analyses" className="link-seta">
              Histórico <Icone nome="arrow" tamanho={16} />
            </Link>
          </div>
          {dadosPainel.analises.length === 0 ? (
            <p className="destaque__vazio">{mensagemAnalises}</p>
          ) : (
            <ul className="registros">
              {dadosPainel.analises.slice(0, 5).map((analise) => (
                <li key={analise.id}>
                  <Link to={`/analyses/${analise.id}`} className="registro registro--link">
                    <div>
                      <p className="registro__titulo">
                        {analise.productName ?? dadosPainel.produtos[analise.productId]?.name ?? 'Produto removido'}
                      </p>
                      <p className="registro__detalhes">{formatarDataHora(analise.createdAt)}</p>
                    </div>
                    <div className="registro__lateral" style={{ width: 130 }}>
                      <div style={{ flex: 1 }}>
                        <BarraCores contagens={contarClassificacoes(analise.findings)} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="secao" aria-labelledby="markets-title">
          <div className="secao__cabecalho">
            <div className="secao__texto">
              <h2 id="markets-title">Mercados disponíveis</h2>
              <p className="secao__descricao">Confira as regras vigentes cadastradas para cada destino.</p>
            </div>
            <Link to="/rules" className="link-seta">
              Regras <Icone nome="arrow" tamanho={16} />
            </Link>
          </div>
          <ul className="registros">
            {dadosPainel.mercados.map((mercado) => {
              const vigentes = regrasVigentes.filter(
                (regra) => regra.marketIds.includes(mercado.id),
              ).length
              return (
                <li key={mercado.id ?? mercado.code}>
                  <Link to="/rules" className="registro registro--link">
                    <div>
                      <p className="registro__titulo">{mercado.name}</p>
                      <p className="registro__detalhes">
                        {pluralizar(vigentes, 'regra vigente', 'regras vigentes')}
                      </p>
                    </div>
                    <span className="code">{mercado.code}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
      <GuiaSecoes />
    </div>
  )
}

function VisaoGeral({ quantidadeProdutos, quantidadeRegras, quantidadeMercados }) {
  const indicadores = [
    { rotulo: 'Produtos cadastrados', quantidade: quantidadeProdutos },
    { rotulo: 'Regras vigentes', quantidade: quantidadeRegras },
    { rotulo: 'Mercados disponíveis', quantidade: quantidadeMercados },
  ]

  return (
    <section className="panorama" aria-label="Visão geral dos cadastros">
      <dl className="panorama__itens">
        {indicadores.map((indicador) => (
          <div key={indicador.rotulo} className="panorama__item">
            <dt>{indicador.rotulo}</dt>
            <dd>{indicador.quantidade.toLocaleString('pt-BR')}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
