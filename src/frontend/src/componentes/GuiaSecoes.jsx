import { Link } from 'react-router-dom'
import { SECOES_PACKRULE } from '../conteudo/guia.js'
import { Icone } from './Icone.jsx'

export function GuiaSecoes() {
  return (
    <section className="guia-secoes" aria-labelledby="sections-guide-title">
      <div className="secao__cabecalho">
        <h2 id="sections-guide-title">Conheça cada área</h2>
        <Link to="/how-to-use" className="link-seta">
          Como usar <Icone nome="arrow" tamanho={16} />
        </Link>
      </div>
      <ul className="guia-secoes__lista">
        {SECOES_PACKRULE.map((secao) => (
          <li key={secao.destino}>
            <Link to={secao.destino} className="guia-secoes__link">
              <span className="guia-secoes__titulo">
                {secao.titulo} <Icone nome="arrow" tamanho={14} />
              </span>
              <span className="guia-secoes__descricao">{secao.descricao}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
