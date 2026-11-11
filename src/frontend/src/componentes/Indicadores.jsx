import { CLASSIFICACOES } from '../config.js'

export function SeloClassificacao({ classificacao }) {
  return (
    <span className={`situacao situacao--${classificacao.toLowerCase()}`}>
      <i className="marcador" aria-hidden="true" />
      {CLASSIFICACOES[classificacao].label}
    </span>
  )
}

const ORDEM_CLASSIFICACOES = Object.keys(CLASSIFICACOES).sort(
  (a, b) => CLASSIFICACOES[a].order - CLASSIFICACOES[b].order,
)

export function BarraCores({ contagens }) {
  const rotulo = ORDEM_CLASSIFICACOES.map((chave) => `${contagens[chave]} ${CLASSIFICACOES[chave].label}`).join(', ')

  return (
    <div className="barra-cores" role="img" aria-label={rotulo}>
      {ORDEM_CLASSIFICACOES.filter((chave) => contagens[chave] > 0).map((chave) => (
        <div
          key={chave}
          className={`barra-cores__parte barra-cores__parte--${chave.toLowerCase()}`}
          style={{ flexGrow: contagens[chave] }}
        />
      ))}
    </div>
  )
}


export function ResumoAnalise({ titulo, subtitulo, contagens, selecionado, aoSelecionar, nota }) {
  const interativo = Boolean(aoSelecionar)

  return (
    <aside className="resumo" aria-label={titulo}>
      <h2 className="resumo__titulo">{titulo}</h2>
      {subtitulo && <p className="resumo__subtitulo">{subtitulo}</p>}
      <div className="resumo__linha-forte" />

      <ul className="resumo__linhas">
        {ORDEM_CLASSIFICACOES.map((chave) => {
          const conteudo = (
            <>
              <SeloClassificacao classificacao={chave} />
              <span className="resumo__valor">{contagens[chave]}</span>
            </>
          )

          return (
            <li key={chave}>
              {interativo ? (
                <button
                  type="button"
                  className="resumo__linha"
                  aria-pressed={selecionado === chave}
                  onClick={() => aoSelecionar(selecionado === chave ? '' : chave)}
                >
                  {conteudo}
                </button>
              ) : (
                <div className="resumo__linha">{conteudo}</div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="resumo__barra">
        <BarraCores contagens={contagens} />
      </div>
      {nota && <p className="resumo__nota">{nota}</p>}
    </aside>
  )
}
