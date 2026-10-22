import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncContent } from '../../components/AsyncContent'
import { ColorBar } from '../../components/ColorBar'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { analysisService } from '../../services/analysisService'
import { marketService } from '../../services/marketService'
import { packagingService } from '../../services/packagingService'
import { productService } from '../../services/productService'
import { countByClassification, indexById } from '../../utils/analysis'
import { formatDate, formatDateTime, pluralize } from '../../utils/format'

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
        eyebrow={data ? pluralize(data.analyses.length, 'análise', 'análises') : 'Registro'}
        title="Histórico"
        description="Cada análise fica vinculada ao produto e à versão exata da embalagem que foi verificada."
        actions={
          <Link to="/analyses/new" className="btn">
            Nova análise
          </Link>
        }
      />

      <AsyncContent loading={loading} error={error}>
        {data &&
          (data.analyses.length === 0 ? (
            <EmptyState
              title="Nenhuma análise executada"
              description="Execute a primeira análise para ver os resultados aqui."
              action={
                <Link to="/analyses/new" className="btn btn--small">
                  Executar análise
                </Link>
              }
            />
          ) : (
            <ul className="entries">
              {data.analyses.map((analysis) => (
                <li key={analysis.id} className="entry">
                  <Link to={`/analyses/${analysis.id}`} style={{ textDecoration: 'none' }}>
                    <p className="entry__title">
                      {data.products[analysis.productId]?.name ?? 'Produto removido'}
                    </p>
                    <p className="entry__meta">
                      v{data.versions[analysis.versionId]?.number ?? '?'} ·{' '}
                      {analysis.marketIds
                        .map((marketId) => data.markets[marketId]?.code)
                        .join(' · ')}{' '}
                      · ref. {formatDate(analysis.referenceDate)} ·{' '}
                      {formatDateTime(analysis.createdAt)}
                    </p>
                  </Link>
                  <div className="entry__side">
                    <div style={{ width: 150 }}>
                      <ColorBar counts={countByClassification(analysis.findings)} />
                    </div>
                    <Link to={`/analyses/${analysis.id}`} className="link-action">
                      Abrir
                    </Link>
                    <button
                      type="button"
                      className="link-action link-action--danger"
                      onClick={() => setAnalysisToDelete(analysis)}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ))}
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
