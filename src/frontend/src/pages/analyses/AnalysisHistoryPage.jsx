import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncContent } from '../../components/AsyncContent'
import { ColorBar } from '../../components/ColorBar'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { analysisService } from '../../services/analysisService'
import { marketService } from '../../services/marketService'
import { packagingService } from '../../services/packagingService'
import { productService } from '../../services/productService'
import { countByClassification, indexById } from '../../utils/analysis'
import { formatDate, formatDateTime } from '../../utils/format'

export function AnalysisHistoryPage() {
  useDocumentTitle('Histórico de análises')
  const { notify } = useToast()
  const [analysisToDelete, setAnalysisToDelete] = useState(null)

  const { data, loading, error, reload } = useAsync(async () => {
    const [analyses, products, versions, markets] = await Promise.all([
      analysisService.list(),
      productService.list(),
      packagingService.listAll(),
      marketService.list(),
    ])
    return {
      analyses,
      products: indexById(products),
      versions: indexById(versions),
      markets: indexById(markets),
    }
  })

  async function handleDelete() {
    try {
      await analysisService.remove(analysisToDelete.id)
      notify('Análise excluída.')
      reload()
    } catch (err) {
      notify(err.message, 'error')
    }
    setAnalysisToDelete(null)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Registro"
        title="Histórico de análises"
        description="Cada análise fica vinculada ao produto e à versão exata da embalagem que foi verificada."
        actions={
          <Link to="/analyses/new" className="btn btn--accent">
            <Icon name="plus" /> Nova análise
          </Link>
        }
      />

      <AsyncContent loading={loading} error={error}>
        {data && (
          <div className="card">
            {data.analyses.length === 0 ? (
              <EmptyState
                title="Nenhuma análise executada"
                description="Execute a primeira análise para ver os resultados aqui."
                action={
                  <Link to="/analyses/new" className="btn">
                    Executar análise
                  </Link>
                }
              />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Mercados</th>
                      <th>Referência</th>
                      <th>Resultado</th>
                      <th>
                        <span className="visually-hidden">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.analyses.map((analysis) => (
                      <tr key={analysis.id}>
                        <td>
                          <Link to={`/analyses/${analysis.id}`} className="table__title">
                            {data.products[analysis.productId]?.name ?? 'Produto removido'}
                          </Link>
                          <p className="list-row__meta">
                            v{data.versions[analysis.versionId]?.number ?? '?'} ·{' '}
                            {formatDateTime(analysis.createdAt)}
                          </p>
                        </td>
                        <td>
                          <div className="row" style={{ gap: 4 }}>
                            {analysis.marketIds.map((marketId) => (
                              <span key={marketId} className="tag">
                                {data.markets[marketId]?.code}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{formatDate(analysis.referenceDate)}</td>
                        <td style={{ minWidth: 200 }}>
                          <ColorBar counts={countByClassification(analysis.findings)} />
                        </td>
                        <td>
                          <div className="table__actions">
                            <Link
                              to={`/analyses/${analysis.id}`}
                              className="btn btn--ghost btn--small"
                            >
                              Abrir
                            </Link>
                            <button
                              type="button"
                              className="btn btn--danger btn--small"
                              onClick={() => setAnalysisToDelete(analysis)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </AsyncContent>

      <ConfirmDialog
        open={Boolean(analysisToDelete)}
        title="Excluir análise?"
        message="A análise e seus resultados serão removidos do histórico."
        confirmLabel="Excluir análise"
        onConfirm={handleDelete}
        onCancel={() => setAnalysisToDelete(null)}
      />
    </div>
  )
}
