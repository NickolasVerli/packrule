import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Conteudo, Confirmacao, ListaVazia, Cabecalho } from '../componentes/Elementos.jsx'
import { BarraCores } from '../componentes/Indicadores.jsx'
import { useAvisos } from '../componentes/avisos.js'
import { useDados, useTitulo } from '../hooks.js'
import { analises, mercados, embalagens, produtos } from '../dados.js'
import { contarClassificacoes, indexarPorId, formatarData, formatarDataHora, pluralizar } from '../utils.js'

export function Historico() {
  useTitulo('Histórico de análises')
  const { avisar } = useAvisos()
  const [analiseExcluir, setAnaliseExcluir] = useState(null)

  const { dados, carregando, erro, recarregar } = useDados(async () => {
    const [listaAnalises, listaProdutos, listaVersoes, listaMercados] = await Promise.all([
      analises.listar(),
      produtos.listar(),
      embalagens.listarTodas(),
      mercados.listar(),
    ])
    return {
      analises: listaAnalises,
      produtos: indexarPorId(listaProdutos),
      versoes: indexarPorId(listaVersoes),
      mercados: indexarPorId(listaMercados),
    }
  })

  async function excluir() {
    try {
      await analises.excluir(analiseExcluir.id)
      avisar('Análise excluída.')
      recarregar()
    } catch (erro) {
      avisar(erro.message, 'error')
    }
    setAnaliseExcluir(null)
  }

  return (
    <div className="pagina">
      <Cabecalho
        sobretitulo={dados ? pluralizar(dados.analises.length, 'análise', 'análises') : 'Registro'}
        titulo="Histórico"
        descricao="Cada análise fica vinculada ao produto e à versão exata da embalagem que foi verificada."
        acoes={
          <Link to="/analyses/new" className="botao">
            Nova análise
          </Link>
        }
      />

      <Conteudo carregando={carregando} erro={erro}>
        {dados &&
          (dados.analises.length === 0 ? (
            <ListaVazia
              titulo="Nenhuma análise executada"
              descricao="Execute a primeira análise para ver os resultados aqui."
              acao={
                <Link to="/analyses/new" className="botao botao--pequeno">
                  Executar análise
                </Link>
              }
            />
          ) : (
            <ul className="registros">
              {dados.analises.map((analise) => (
                <li key={analise.id} className="registro">
                  <Link to={`/analyses/${analise.id}`} style={{ textDecoration: 'none' }}>
                    <p className="registro__titulo">
                      {analise.productName ?? dados.produtos[analise.productId]?.name ?? 'Produto removido'}
                    </p>
                    <p className="registro__detalhes">
                      v{dados.versoes[analise.versionId]?.number ?? '?'} ·{' '}
                      {analise.marketIds
                        .map((mercadoId) => dados.mercados[mercadoId]?.code)
                        .join(' · ')}{' '}
                      · ref. {formatarData(analise.referenceDate)} ·{' '}
                      {formatarDataHora(analise.createdAt)}
                    </p>
                  </Link>
                  <div className="registro__lateral">
                    <div style={{ width: 150 }}>
                      <BarraCores contagens={contarClassificacoes(analise.findings)} />
                    </div>
                    <Link to={`/analyses/${analise.id}`} className="acao">
                      Abrir
                    </Link>
                    <button
                      type="button"
                      className="acao acao--perigo"
                      onClick={() => setAnaliseExcluir(analise)}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ))}
      </Conteudo>

      <Confirmacao
        aberto={Boolean(analiseExcluir)}
        titulo="Excluir análise?"
        mensagem="A análise e seus resultados serão removidos do histórico."
        textoConfirmar="Excluir análise"
        aoConfirmar={excluir}
        aoCancelar={() => setAnaliseExcluir(null)}
      />
    </div>
  )
}
