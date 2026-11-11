import { Link } from 'react-router-dom'
import { useTitulo } from '../hooks.js'

export function NaoEncontrada() {
  useTitulo('Página não encontrada')

  return (
    <div className="nao-encontrada">
      <span className="nao-encontrada__codigo">404</span>
      <h1>Página não encontrada</h1>
      <p className="suave">O endereço não existe ou foi movido.</p>
      <Link to="/" className="botao">
        Voltar ao painel
      </Link>
    </div>
  )
}
