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
import { pluralize, todayIso } from '../../utils/format'

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
            <div className="card">
              <EmptyState
                title="Nenhuma embalagem para analisar"
                description="Cadastre um produto e envie uma versão da embalagem antes de executar uma análise."
                action={
                  <Link to="/products" className="btn">
                    Ir para produtos
                  </Link>
                }
              />
            </div>
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
    () => versions.filter((version) => version.productId === productId).sort((a, b) => b.number - a.number),
    [versions, productId],
  )
  const selectedProduct = products.find((product) => product.id === productId)
  const selectedVersion = versions.find((version) => version.id === versionId)

  const applicableCount = useMemo(() => {
    if (!selectedProduct || !referenceDate) return 0
    return marketIds.reduce(
      (total, marketId) =>
        total + rules.filter((rule) => isRuleApplicable(rule, selectedProduct, marketId, referenceDate)).length,
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
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="card__body stack">
        {submitError && <Alert tone="error">{submitError}</Alert>}

        <div className="form-grid">
          <FormField id="product" label="Produto">
            <select id="product" className="select" value={productId} onChange={handleProductChange}>
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

          <FormField id="version" label="Versão da embalagem">
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
            Esta versão não tem texto extraído, então todas as regras terminarão em Manual Review.{' '}
            <Link to={`/versions/${selectedVersion.id}`}>Revisar o texto</Link>
          </Alert>
        )}

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="field__label" style={{ padding: 0, marginBottom: 8 }}>
            Mercados de destino
          </legend>
          <div className="choice-grid">
            {markets.map((market) => (
              <label key={market.id} className="choice">
                <input
                  type="checkbox"
                  checked={marketIds.includes(market.id)}
                  onChange={() => toggleMarket(market.id)}
                />
                <span>{market.name}</span>
                <span className="choice__code">{market.code}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-grid">
          <FormField
            id="referenceDate"
            label="Data de referência"
            hint="Data em que o produto será comercializado. Define quais regras estão em vigor."
          >
            <input
              id="referenceDate"
              type="date"
              className="input"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
              required
            />
          </FormField>
        </div>

        {selectedProduct && marketIds.length > 0 && (
          <Alert tone="info">
            {pluralize(applicableCount, 'regra aplicável', 'regras aplicáveis')} para{' '}
            <strong>{selectedProduct.category}</strong> nos mercados selecionados em{' '}
            {referenceDate.split('-').reverse().join('/')}.
          </Alert>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn--accent" disabled={running}>
            {running ? 'Analisando…' : 'Executar análise'}
          </button>
          <Link to="/analyses" className="btn btn--ghost">
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  )
}
