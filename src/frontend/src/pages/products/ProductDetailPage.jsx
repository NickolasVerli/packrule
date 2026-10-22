import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AsyncContent } from '../../components/AsyncContent'
import { ColorBar } from '../../components/ColorBar'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { analysisService } from '../../services/analysisService'
import { packagingService } from '../../services/packagingService'
import { productService } from '../../services/productService'
import { countByClassification } from '../../utils/analysis'
import { formatDate, formatDateTime, formatFileSize } from '../../utils/format'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [confirming, setConfirming] = useState(null)

  const { data, loading, error, reload } = useAsync(async () => {
    const [product, versions, analyses] = await Promise.all([
      productService.get(id),
      packagingService.listByProduct(id),
      analysisService.list(),
    ])
    return { product, versions, analyses: analyses.filter((a) => a.productId === id) }
  }, [id])

  useDocumentTitle(data?.product.name ?? 'Produto')

  async function handleConfirm() {
    const action = confirming
    setConfirming(null)
    try {
      if (action.type === 'product') {
        await productService.remove(id)
        notify('Produto excluído.')
        navigate('/products')
        return
      }
      await packagingService.remove(action.version.id)
      notify('Versão excluída.')
      reload()
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  return (
    <div className="page">
      <AsyncContent loading={loading} error={error}>
        {data && (
          <>
            <PageHeader
              eyebrow={data.product.category}
              title={data.product.name}
              description={data.product.description || undefined}
              actions={
                <>
                  <Link to={`/products/${id}/edit`} className="link-action">
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="link-action link-action--danger"
                    onClick={() => setConfirming({ type: 'product' })}
                  >
                    Excluir
                  </button>
                </>
              }
            />

            <section className="section" aria-labelledby="versions-title">
              <div className="section__header">
                <h2 id="versions-title">Versões da embalagem</h2>
                <Link to={`/products/${id}/versions/new`} className="btn btn--outline btn--small">
                  Nova versão
                </Link>
              </div>

              {data.versions.length === 0 ? (
                <EmptyState
                  title="Nenhuma embalagem enviada"
                  description="Envie o arquivo da embalagem em PDF, PNG ou JPG para poder analisá-la."
                />
              ) : (
                <ul className="entries">
                  {data.versions.map((version) => (
                    <li key={version.id} className="version-entry">
                      <span className="version-number">v{version.number}</span>
                      <div>
                        <Link
                          to={`/versions/${version.id}`}
                          className="entry__title"
                          style={{ textDecoration: 'none' }}
                        >
                          {version.fileName}
                        </Link>
                        <p className="entry__meta">
                          {formatDateTime(version.uploadedAt)} · {formatFileSize(version.fileSize)}
                          {version.material && ` · ${version.material}`}
                        </p>
                        <p className="version-entry__excerpt">
                          {version.extractedText ||
                            'Sem texto extraído. A análise indicará Manual Review.'}
                        </p>
                      </div>
                      <div className="version-entry__actions">
                        <Link to={`/analyses/new?version=${version.id}`} className="btn btn--small">
                          Analisar
                        </Link>
                        <button
                          type="button"
                          className="link-action link-action--danger"
                          onClick={() => setConfirming({ type: 'version', version })}
                        >
                          Excluir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="section" aria-labelledby="analyses-title">
              <div className="section__header">
                <h2 id="analyses-title">Análises realizadas</h2>
              </div>
              {data.analyses.length === 0 ? (
                <EmptyState
                  title="Nenhuma análise ainda"
                  description="As análises executadas para este produto aparecerão aqui."
                />
              ) : (
                <ul className="entries">
                  {data.analyses.map((analysis) => {
                    const version = data.versions.find((v) => v.id === analysis.versionId)
                    return (
                      <li key={analysis.id}>
                        <Link to={`/analyses/${analysis.id}`} className="entry entry--link">
                          <div>
                            <p className="entry__title">
                              Versão v{version?.number ?? '?'} · referência{' '}
                              {formatDate(analysis.referenceDate)}
                            </p>
                            <p className="entry__meta">{formatDateTime(analysis.createdAt)}</p>
                          </div>
                          <div className="entry__side" style={{ width: 150 }}>
                            <div style={{ flex: 1 }}>
                              <ColorBar counts={countByClassification(analysis.findings)} />
                            </div>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </AsyncContent>

      <ConfirmDialog
        open={Boolean(confirming)}
        title={confirming?.type === 'product' ? 'Excluir produto?' : 'Excluir versão?'}
        message={
          confirming?.type === 'product'
            ? 'O produto será excluído com todas as versões de embalagem e análises. Essa ação não pode ser desfeita.'
            : 'A versão e as análises feitas sobre ela serão excluídas. Essa ação não pode ser desfeita.'
        }
        confirmLabel="Excluir"
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(null)}
      />
    </div>
  )
}
