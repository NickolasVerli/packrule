import { useEffect, useRef } from 'react'

export function Alerta({ tom = 'info', children: conteudo }) {
  return (
    <div className={`alerta alerta--${tom}`} role={tom === 'error' ? 'alert' : 'note'}>
      {conteudo}
    </div>
  )
}

export function Conteudo({ carregando, erro, children: conteudo }) {
  if (carregando) {
    return (
      <div className="carregando" role="status">
        <span className="carregador" />
        Carregando…
      </div>
    )
  }

  if (erro) return <Alerta tom="error">{erro}</Alerta>

  return conteudo
}

export function Confirmacao({ aberto, titulo, mensagem, textoConfirmar, aoConfirmar, aoCancelar }) {
  const dialogoRef = useRef(null)

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (aberto && !dialogo.open) dialogo.showModal()
    if (!aberto && dialogo.open) dialogo.close()
  }, [aberto])

  return (
    <dialog ref={dialogoRef} className="dialogo" onCancel={aoCancelar} aria-labelledby="dialog-title">
      <div className="dialogo__conteudo">
        <h2 id="dialog-title">{titulo}</h2>
        <p className="suave">{mensagem}</p>
      </div>
      <div className="dialogo__acoes">
        <button type="button" className="botao botao--contorno botao--pequeno" onClick={aoCancelar}>
          Cancelar
        </button>
        <button type="button" className="botao botao--pequeno" onClick={aoConfirmar}>
          {textoConfirmar}
        </button>
      </div>
    </dialog>
  )
}

export function ListaVazia({ titulo, descricao, acao }) {
  return (
    <div className="vazio">
      <h3>{titulo}</h3>
      {descricao && <p>{descricao}</p>}
      {acao}
    </div>
  )
}

export function Campo({ id, rotulo, dica, erro, className: classe = '', children: conteudo }) {
  return (
    <div className={`campo ${classe}`}>
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
      </label>
      {conteudo}
      {dica && !erro && <span className="campo__dica">{dica}</span>}
      {erro && <span className="campo__erro">{erro}</span>}
    </div>
  )
}

export function Cabecalho({ sobretitulo, titulo, descricao, acoes }) {
  return (
    <header className="cabecalho">
      <div className="cabecalho__texto">
        {sobretitulo && <p className="sobretitulo">{sobretitulo}</p>}
        <h1>{titulo}</h1>
        {descricao && <p className="cabecalho__descricao">{descricao}</p>}
      </div>
      {acoes && <div className="cabecalho__acoes">{acoes}</div>}
    </header>
  )
}
