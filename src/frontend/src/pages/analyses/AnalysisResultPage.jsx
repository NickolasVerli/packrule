import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { AsyncContent } from '../../components/AsyncContent'
import { ClassificationBadge } from '../../components/ClassificationBadge'
import { ColorBar } from '../../components/ColorBar'
import { EmptyState } from '../../components/EmptyState'
import { PageHeader } from '../../components/PageHeader'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { analysisService } from '../../services/analysisService'
import { marketService } from '../../services/marketService'
import { packagingService } from '../../services/packagingService'
import { productService } from '../../services/productService'
import { ruleService } from '../../services/ruleService'
import { countByClassification, indexById } from '../../utils/analysis'
import { CLASSIFICATIONS } from '../../utils/constants'
import { formatDate, formatDateTime } from '../../utils/format'

export function AnalysisResultPage() {
  const { id } = useParams()

  const { data, loading, error } = useAsync(async () => {
    const analysis = await analysisService.get(id)
    const [product, version, markets, rules] = await Promise.all([
      productService.get(analysis.productId).catch(() => null),
      packagingService.get(analysis.versionId).catch(() => null),
      marketService.list(),
      ruleService.list(),
    ])
    return { analysis, product, version, markets: indexById(markets), rules: indexById(rules) }
  }, [id])

  useDocumentTitle(data?.product ? `Análise · ${data.product.name}` : 'Análise')

  return (
    <div className="page">
      <AsyncContent loading={loading} error={error}>
        {data && <AnalysisResult {...data} />}
      </AsyncContent>
    </div>
  )
}

function AnalysisResult({ analysis, product, version, markets, rules }) {
  const [classificationFilter, setClassificationFilter] = useState('')
  const [marketFilter, setMarketFilter] = useState('')

  const counts = useMemo(() => countByClassification(analysis.findings), [analysis.findings])
  const visibleFindings = analysis.findings.filter(
    (finding) =>
      (!classificationFilter || finding.classification === classificationFilter) &&
      (!marketFilter || finding.marketId === marketFilter),
  )
  const marketsWithoutRules = analysis.marketIds.filter(
    (marketId) => !analysis.findings.some((finding) => finding.marketId === marketId),
  )

  return (
    <>
      <PageHeader
        eyebrow={`Análise · ${formatDateTime(analysis.createdAt)}`}
        title={product?.name ?? 'Produto removido'}
        description={`Versão v${version?.number ?? '?'} · referência em ${formatDate(analysis.referenceDate)}`}
        actions={
          <>
            <Link to="/analyses" className="btn btn--ghost">
              Histórico
            </Link>
            {version && (
              <Link to={`/analyses/new?version=${version.id}`} className="btn btn--accent">
                Nova análise
              </Link>
            )}
          </>
        }
      />

      <section className="proof card__body" aria-label="Resumo da análise">
        <ColorBar counts={counts} />
        <p className="muted" style={{ marginTop: 12 }}>
          Mercados:{' '}
          {analysis.marketIds.map((marketId) => markets[marketId]?.name).filter(Boolean).join(', ')}
        </p>
      </section>

      <Alert tone="info">
        Passed indica apenas que a regra verificada foi atendida com base no texto informado. O
        resultado não é certificação nem garantia jurídica de comercialização.
      </Alert>

      {marketsWithoutRules.length > 0 && (
        <Alert tone="warning">
          Nenhuma regra vigente foi encontrada para{' '}
          {marketsWithoutRules.map((marketId) => markets[marketId]?.name).join(', ')} nessa data e
          categoria. Considere uma revisão manual.
        </Alert>
      )}

      {analysis.findings.length > 0 && (
        <div className="stack">
          <div className="tabs" role="group" aria-label="Filtrar por classificação">
            <button
              type="button"
              className="tab"
              aria-pressed={classificationFilter === ''}
              onClick={() => setClassificationFilter('')}
            >
              Todos ({analysis.findings.length})
            </button>
            {Object.entries(CLASSIFICATIONS)
              .filter(([key]) => counts[key] > 0)
              .map(([key, classification]) => (
                <button
                  key={key}
                  type="button"
                  className="tab"
                  aria-pressed={classificationFilter === key}
                  onClick={() => setClassificationFilter(key)}
                >
                  {classification.label} ({counts[key]})
                </button>
              ))}
          </div>

          {analysis.marketIds.length > 1 && (
            <div className="tabs" role="group" aria-label="Filtrar por mercado">
              <button
                type="button"
                className="tab"
                aria-pressed={marketFilter === ''}
                onClick={() => setMarketFilter('')}
              >
                Todos os mercados
              </button>
              {analysis.marketIds.map((marketId) => (
                <button
                  key={marketId}
                  type="button"
                  className="tab"
                  aria-pressed={marketFilter === marketId}
                  onClick={() => setMarketFilter(marketId)}
                >
                  {markets[marketId]?.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <section className="card" aria-label="Resultados">
        {visibleFindings.length === 0 ? (
          <EmptyState
            title="Nenhum resultado para mostrar"
            description="Não há verificações com esse filtro."
          />
        ) : (
          <ul>
            {visibleFindings.map((finding) => {
              const rule = rules[finding.ruleId]
              return (
                <li
                  key={finding.id}
                  className={`finding finding--${finding.classification.toLowerCase()}`}
                >
                  <span className="finding__rail" />
                  <div className="finding__body">
                    <div className="finding__head">
                      <ClassificationBadge classification={finding.classification} />
                      <span className="tag">{markets[finding.marketId]?.code}</span>
                      <h3>{rule?.title ?? 'Regra removida'}</h3>
                    </div>
                    <p>{finding.explanation}</p>
                    {rule && <p className="finding__source">{rule.source}</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
