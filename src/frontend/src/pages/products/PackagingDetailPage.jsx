import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { AsyncContent } from '../../components/AsyncContent'
import { FormField } from '../../components/FormField'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { packagingService } from '../../services/packagingService'
import { productService } from '../../services/productService'
import { formatDateTime, formatFileSize } from '../../utils/format'

export function PackagingDetailPage() {
  const { id } = useParams()
  const { data, loading, error } = useAsync(async () => {
    const version = await packagingService.get(id)
    const product = await productService.get(version.productId)
    return { version, product }
  }, [id])

  useDocumentTitle(data ? `${data.product.name} v${data.version.number}` : 'Embalagem')

  return (
    <div className="page">
      <AsyncContent loading={loading} error={error}>
        {data && (
          <>
            <PageHeader
              eyebrow={data.product.name}
              title={`Versão v${data.version.number}`}
              description={data.version.fileName}
              actions={
                <>
                  <Link to={`/products/${data.product.id}`} className="btn btn--ghost">
                    Voltar ao produto
                  </Link>
                  <Link to={`/analyses/new?version=${data.version.id}`} className="btn btn--accent">
                    Analisar esta versão
                  </Link>
                </>
              }
            />

            <section className="card card__body" aria-label="Dados do arquivo">
              <dl className="meta-grid">
                <div>
                  <dt>Enviado em</dt>
                  <dd>{formatDateTime(data.version.uploadedAt)}</dd>
                </div>
                <div>
                  <dt>Arquivo</dt>
                  <dd>
                    {data.version.fileName} · {formatFileSize(data.version.fileSize)}
                  </dd>
                </div>
                <div>
                  <dt>Material</dt>
                  <dd>{data.version.material || '—'}</dd>
                </div>
                <div>
                  <dt>Quantidade declarada</dt>
                  <dd>{data.version.declaredQuantity || '—'}</dd>
                </div>
              </dl>
            </section>

            <TextReview version={data.version} />
          </>
        )}
      </AsyncContent>
    </div>
  )
}

function TextReview({ version }) {
  const { notify } = useToast()
  const [text, setText] = useState(version.extractedText)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setSubmitError('')
    try {
      await packagingService.updateText(version.id, text)
      notify('Texto da embalagem atualizado.')
    } catch (err) {
      setSubmitError(err.message)
    }
    setSaving(false)
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card__header">
        <h2>Revisão do texto extraído</h2>
      </div>
      <div className="card__body stack">
        {submitError && <Alert tone="error">{submitError}</Alert>}
        {!text.trim() && (
          <Alert tone="warning">
            Sem texto, todas as regras desta versão terminam em Manual Review.
          </Alert>
        )}
        <FormField
          id="text"
          label="Texto da embalagem"
          hint="Corrija ou complete o texto antes de executar uma nova análise."
        >
          <textarea
            id="text"
            className="textarea textarea--mono"
            rows={10}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </FormField>
        <div className="form-actions">
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar texto'}
          </button>
        </div>
      </div>
    </form>
  )
}
