import { Alert } from './Alert'

export function AsyncContent({ loading, error, children }) {
  if (loading) {
    return (
      <div className="loading" role="status">
        <span className="spinner" />
        Carregando…
      </div>
    )
  }

  if (error) return <Alert tone="error">{error}</Alert>

  return children
}
