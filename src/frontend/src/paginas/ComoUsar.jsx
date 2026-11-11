import { Link } from 'react-router-dom'
import { Cabecalho } from '../componentes/Elementos.jsx'
import { SeloClassificacao } from '../componentes/Indicadores.jsx'
import { Icone } from '../componentes/Icone.jsx'
import { ETAPAS_GUIA, RESULTADOS_GUIA } from '../conteudo/guia.js'
import { useTitulo } from '../hooks.js'

export function ComoUsar() {
  useTitulo('Como usar')

  return (
    <div className="pagina">
      <Cabecalho
        sobretitulo="Guia rápido"
        titulo="Como usar o PackRule"
        descricao="Do cadastro do produto à leitura dos resultados, siga este caminho para verificar sua embalagem."
        acoes={<Link to="/products/new" className="botao">Cadastrar produto</Link>}
      />

      <div className="guia__conteudo">
        <section className="secao" aria-labelledby="guide-flow-title">
          <div className="secao__texto">
            <h2 id="guide-flow-title">Da embalagem ao resultado</h2>
            <p className="secao__descricao">Cinco passos para preparar, verificar e acompanhar cada versão.</p>
          </div>
          <ol className="guia__etapas">
            {ETAPAS_GUIA.map((etapa, indice) => (
              <li key={etapa.titulo} className="etapa guia__etapa">
                <span className="etapa__numero" aria-hidden="true">{String(indice + 1).padStart(2, '0')}</span>
                <div className="etapa__conteudo">
                  <h3 className="etapa__titulo">{etapa.titulo}</h3>
                  <p className="secao__descricao">{etapa.descricao}</p>
                  <Link to={etapa.destino} className="link-seta">
                    {etapa.acao} <Icone nome="arrow" tamanho={16} />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="guia__resultados" aria-labelledby="guide-results-title">
          <div className="secao__texto">
            <h2 id="guide-results-title">Entenda os resultados</h2>
            <p className="secao__descricao">Cada regra verificada gera uma classificação.</p>
          </div>
          <dl className="guia__legenda">
            {RESULTADOS_GUIA.map((resultado) => (
              <div key={resultado.classificacao}>
                <dt><SeloClassificacao classificacao={resultado.classificacao} /></dt>
                <dd>{resultado.descricao}</dd>
              </div>
            ))}
          </dl>
          <p className="guia__nota">
            Aprovado indica que a condição verificada foi atendida. Não é uma certificação de conformidade.
          </p>
        </aside>
      </div>
    </div>
  )
}
