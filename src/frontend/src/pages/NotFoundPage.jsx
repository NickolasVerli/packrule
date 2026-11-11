import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Página não encontrada')

  return (
    <div className="not-found">
      <span className="not-found__code">404</span>
      <h1>Página não encontrada</h1>
      <p className="muted">O endereço não existe ou foi movido.</p>
      <Link to="/" className="btn">
        Voltar ao painel
      </Link>
    </div>
  )
}
