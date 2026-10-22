import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { AsyncContent } from '../../components/AsyncContent'
import { EmptyState } from '../../components/EmptyState'
import { FormField } from '../../components/FormField'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { analysisService } from '../../services/analysisService'
import { isRuleApplicable } from '../../services/complianceEngine'
import { marketService } from '../../services/marketService'
import { packagingService } from '../../services/packagingService'
import { productService } from '../../services/productService'
import { ruleService } from '../../services/ruleService'
import { formatDate, todayIso } from '../../utils/format'

export function NewAnalysisPage() {
  useDocumentTitle('Nova análise')

  const { data, loading, error } = useAsync(async () => {
    const [products, versions, markets, rules] = await Promise.all([
      productService.list(),
      packagingService.listAll(),
      marketService.list(),
      ruleService.list(),
    ])
    return { products, versions, markets, rules }
  })

  return (
    <div className="page">
      <PageHeader
        eyebrow="Verificação"
        title="Nova análise"
        description="Escolha a embalagem, os mercados de destino e a data de referência. Só entram as regras vigentes nessa data."
      />
      <AsyncContent loading={loading} error={error}>
        {data &&
          (data.versions.length === 0 ? (
            <EmptyState
              title="Nenhuma embalagem para analisar"
              description="Cadastre um produto e envie uma versão da embalagem antes de executar uma análise."
              action={
                <Link to="/products" className="btn btn--small">
                  Ir para produtos
                </Link>
              }
            />
          ) : (
            <AnalysisForm {...data} />
          ))}
      </AsyncContent>
    </div>
  )
}

function AnalysisForm({ products, versions, markets, rules }) {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [searchParams] = useSearchParams()

  const presetVersion = versions.find((version) => version.id === searchParams.get('version'))
  const [productId, setProductId] = useState(presetVersion?.productId ?? '')
  const [versionId, setVersionId] = useState(presetVersion?.id ?? '')
  const [marketIds, setMarketIds] = useState([])
  const [referenceDate, setReferenceDate] = useState(todayIso())
  const [submitError, setSubmitError] = useState('')
  const [running, setRunning] = useState(false)

  const productVersions = useMemo(
    () =>
      versions
        .filter((version) => version.productId === productId)
        .sort((a, b) => b.number - a.number),
    [versions, productId],
  )
  const selectedProduct = products.find((product) => product.id === productId)
  const selectedVersion = versions.find((version) => version.id === versionId)
  const selectedMarkets = markets.filter((market) => marketIds.includes(market.id))

  const applicableCount = useMemo(() => {
    if (!selectedProduct || !referenceDate) return 0
    return marketIds.reduce(
      (total, marketId) =>
        total +
        rules.filter((rule) => isRuleApplicable(rule, selectedProduct, marketId, referenceDate))
          .length,
      0,
    )
  }, [rules, selectedProduct, marketIds, referenceDate])

  function handleProductChange(event) {
    const nextProductId = event.target.value
    setProductId(nextProductId)
    const latest = versions
      .filter((version) => version.productId === nextProductId)
      .sort((a, b) => b.number - a.number)[0]
    setVersionId(latest?.id ?? '')
  }

  function toggleMarket(marketId) {
    setMarketIds((current) =>
      current.includes(marketId) ? current.filter((id) => id !== marketId) : [...current, marketId],
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    setRunning(true)
    try {
      const analysis = await analysisService.run({ versionId, marketIds, referenceDate })
      notify('Análise concluída.')
      navigate(`/analyses/${analysis.id}`)
    } catch (err) {
      setSubmitError(err.message)
      setRunning(false)
    }
  }

  return (
    <form className="split" onSubmit={handleSubmit} noValidate>
      <div>
        <div className="step">
          <span className="step__number">1</span>
          <div className="step__body">
            <h2 className="step__title">Embalagem</h2>
            <div className="stack">
              <FormField id="product" label="Produto">
                <select
                  id="product"
                  className="select"
                  value={productId}
                  onChange={handleProductChange}
                >
                  <option value="">Selecione…</option>
                  {products
                    .filter((product) => versions.some((version) => version.productId === product.id))
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                </select>
              </FormField>

              <FormField id="version" label="Versão">
                <select
                  id="version"
                  className="select"
                  value={versionId}
                  onChange={(event) => setVersionId(event.target.value)}
                  disabled={!productId}
                >
                  <option value="">Selecione…</option>
                  {productVersions.map((version) => (
                    <option key={version.id} value={version.id}>
                      v{version.number} · {version.fileName}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {selectedVersion && !selectedVersion.extractedText.trim() && (
              <Alert tone="warning">
                Esta versão não tem texto extraído, então todas as regras terminarão em Manual
                Review. <Link to={`/versions/${selectedVersion.id}`}>Revisar o texto</Link>
              </Alert>
            )}
          </div>
        </div>

        <div className="step">
          <span className="step__number">2</span>
          <div className="step__body">
            <h2 className="step__title">Mercados de destino</h2>
            <fieldset className="fieldset">
              <legend className="visually-hidden">Mercados de destino</legend>
              <div className="chips">
                {markets.map((market) => (
                  <label key={market.id} className="chip">
                    <input
                      type="checkbox"
                      className="visually-hidden"
                      checked={marketIds.includes(market.id)}
                      onChange={() => toggleMarket(market.id)}
                    />
                    {market.name}
                    <code>{market.code}</code>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="step">
          <span className="step__number">3</span>
          <div className="step__body">
            <h2 className="step__title">Data de referência</h2>
            <FormField
              id="referenceDate"
              label="Data de comercialização"
              hint="Define quais regras estão em vigor na análise."
            >
              <input
                id="referenceDate"
                type="date"
                className="input"
                style={{ maxWidth: 260 }}
                value={referenceDate}
                onChange={(event) => setReferenceDate(event.target.value)}
                required
              />
            </FormField>
          </div>
        </div>
      </div>

      <aside className="facts split__aside" aria-label="Resumo da análise">
        <h2 className="facts__title">Resumo</h2>
        <p className="facts__subtitle">Confira antes de executar.</p>
        <div className="facts__thick" />
        <dl className="facts__figures">
          <div className="facts__figure">
            <dt>Produto</dt>
            <dd>{selectedProduct?.name ?? '—'}</dd>
          </div>
          <div className="facts__figure">
            <dt>Versão</dt>
            <dd>{selectedVersion ? `v${selectedVersion.number}` : '—'}</dd>
          </div>
          <div className="facts__figure">
            <dt>Mercados</dt>
            <dd>{selectedMarkets.map((market) => market.code).join(' · ') || '—'}</dd>
          </div>
          <div className="facts__figure">
            <dt>Referência</dt>
            <dd>{referenceDate ? formatDate(referenceDate) : '—'}</dd>
          </div>
          <div className="facts__figure">
            <dt>Regras aplicáveis</dt>
            <dd className="facts__value">{applicableCount}</dd>
          </div>
        </dl>

        <div className="stack" style={{ padding: '18px 0 14px', gap: 12 }}>
          {submitError && <Alert tone="error">{submitError}</Alert>}
          <button type="submit" className="btn btn--block" disabled={running}>
            {running ? 'Analisando…' : 'Executar análise'}
          </button>
        </div>
        <p className="facts__note">
          * A análise fica salva no histórico, vinculada a esta versão da embalagem.
        </p>
      </aside>
    </form>
  )
}
