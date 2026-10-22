import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { AsyncContent } from '../../components/AsyncContent'
import { ClassificationBadge } from '../../components/ClassificationBadge'
import { EmptyState } from '../../components/EmptyState'
import { FactsPanel } from '../../components/FactsPanel'
import { PageHeader } from '../../components/PageHeader'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { analysisService } from '../../services/analysisService'
import { marketService } from '../../services/marketService'
import { packagingService } from '../../services/packagingService'
import { productService } from '../../services/productService'
import { ruleService } from '../../services/ruleService'
import { countByClassification, indexById } from '../../utils/analysis'
import { formatDate, formatDateTime } from '../../utils/format'

const FACTS_NOTE =
  '* Passed indica apenas que a regra verificada foi atendida com base no texto informado. Não é certificação nem garantia jurídica de comercialização.'

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

  const groups = analysis.marketIds
    .filter((marketId) => !marketFilter || marketId === marketFilter)
    .map((marketId) => ({
      marketId,
      findings: analysis.findings.filter(
        (finding) =>
          finding.marketId === marketId &&
          (!classificationFilter || finding.classification === classificationFilter),
      ),
    }))
    .filter((group) => group.findings.length > 0)

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
            <Link to="/analyses" className="link-action">
              Histórico
            </Link>
            {version && (
              <Link to={`/analyses/new?version=${version.id}`} className="btn">
                Nova análise
              </Link>
            )}
          </>
        }
      />

      <div className="split">
        <div className="stack" style={{ gap: 36 }}>
          {marketsWithoutRules.length > 0 && (
            <Alert tone="warning">
              Nenhuma regra vigente foi encontrada para{' '}
              {marketsWithoutRules.map((marketId) => markets[marketId]?.name).join(', ')} nessa data
              e categoria. Considere uma revisão manual.
            </Alert>
          )}

          {analysis.marketIds.length > 1 && (
            <div className="filter-tabs" role="group" aria-label="Filtrar por mercado">
              <button
                type="button"
                className="filter-tab"
                aria-pressed={marketFilter === ''}
                onClick={() => setMarketFilter('')}
              >
                Todos os mercados
              </button>
              {analysis.marketIds.map((marketId) => (
                <button
                  key={marketId}
                  type="button"
                  className="filter-tab"
                  aria-pressed={marketFilter === marketId}
                  onClick={() => setMarketFilter(marketId)}
                >
                  {markets[marketId]?.name}
                </button>
              ))}
            </div>
          )}

          {groups.length === 0 ? (
            <EmptyState
              title="Nenhum resultado para mostrar"
              description="Não há verificações com esse filtro."
            />
          ) : (
            groups.map((group) => (
              <section key={group.marketId} className="market-group">
                <div className="market-group__title">
                  <h2>{markets[group.marketId]?.name}</h2>
                  <span className="code">{markets[group.marketId]?.code}</span>
                </div>
                <ul className="entries">
                  {group.findings.map((finding) => {
                    const rule = rules[finding.ruleId]
                    return (
                      <li key={finding.id} className="finding">
                        <ClassificationBadge classification={finding.classification} />
                        <div className="finding__body">
                          <h3>{rule?.title ?? 'Regra removida'}</h3>
                          <p className="muted">{finding.explanation}</p>
                          {rule && <p className="finding__source">{rule.source}</p>}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))
          )}
        </div>

        <div className="split__aside">
          <FactsPanel
            title="Compliance Facts"
            subtitle={`${analysis.findings.length} verificações · filtre por resultado`}
            counts={counts}
            selected={classificationFilter}
            onSelect={setClassificationFilter}
            note={FACTS_NOTE}
          />
        </div>
      </div>
    </>
  )
}
