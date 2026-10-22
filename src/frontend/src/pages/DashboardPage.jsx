import { Link } from 'react-router-dom'
import { AsyncContent } from '../components/AsyncContent'
import { ColorBar } from '../components/ColorBar'
import { FactsPanel } from '../components/FactsPanel'
import { Icon } from '../components/Icon'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { analysisService } from '../services/analysisService'
import { isRuleInEffect } from '../services/complianceEngine'
import { marketService } from '../services/marketService'
import { productService } from '../services/productService'
import { ruleService } from '../services/ruleService'
import { countByClassification, indexById } from '../utils/analysis'
import { formatDateTime, pluralize, todayIso } from '../utils/format'

const FACTS_NOTE =
  '* Resultados acumulados de todas as análises. Passed indica apenas que a regra verificada foi atendida; não é certificação nem garantia jurídica.'

export function DashboardPage() {
  useDocumentTitle()

  const { data, loading, error } = useAsync(async () => {
    const [products, rules, analyses, markets] = await Promise.all([
      productService.list(),
      ruleService.list(),
      analysisService.list(),
      marketService.list(),
    ])
    return { products: indexById(products), rules, analyses, markets }
  })

  const findings = data ? data.analyses.flatMap((analysis) => analysis.findings) : []

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Pré-verificação de embalagens</p>
          <h1 className="hero__title">O que revisar antes de vender neste mercado?</h1>
          <p className="hero__lead">
            Cruze produto, embalagem, mercado e data. O PackRule mostra quais regras se aplicam e o
            que precisa mudar antes da impressão.
          </p>
          <div className="cluster" style={{ gap: 28 }}>
            <Link to="/analyses/new" className="btn">
              Nova análise
            </Link>
            <Link to="/products" className="link-arrow">
              Ver produtos <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>

        <FactsPanel
          title="Compliance Facts"
          subtitle={
            data
              ? `${pluralize(data.analyses.length, 'análise', 'análises')} · ${pluralize(findings.length, 'verificação', 'verificações')}`
              : 'Carregando…'
          }
          counts={countByClassification(findings)}
          note={FACTS_NOTE}
        />
      </section>

      <AsyncContent loading={loading} error={error}>
        {data && (
          <div className="two-col">
            <section className="section" aria-labelledby="recent-title">
              <div className="section__header">
                <h2 id="recent-title">Análises recentes</h2>
                <Link to="/analyses" className="link-arrow">
                  Histórico <Icon name="arrow" size={16} />
                </Link>
              </div>
              {data.analyses.length === 0 ? (
                <p className="hero__empty">Nenhuma análise executada ainda.</p>
              ) : (
                <ul className="entries">
                  {data.analyses.slice(0, 5).map((analysis) => (
                    <li key={analysis.id}>
                      <Link to={`/analyses/${analysis.id}`} className="entry entry--link">
                        <div>
                          <p className="entry__title">
                            {data.products[analysis.productId]?.name ?? 'Produto removido'}
                          </p>
                          <p className="entry__meta">{formatDateTime(analysis.createdAt)}</p>
                        </div>
                        <div className="entry__side" style={{ width: 130 }}>
                          <div style={{ flex: 1 }}>
                            <ColorBar counts={countByClassification(analysis.findings)} />
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="section" aria-labelledby="markets-title">
              <div className="section__header">
                <h2 id="markets-title">Mercados cobertos</h2>
                <Link to="/rules" className="link-arrow">
                  Regras <Icon name="arrow" size={16} />
                </Link>
              </div>
              <ul className="entries">
                {data.markets.map((market) => {
                  const inEffect = data.rules.filter(
                    (rule) => rule.marketIds.includes(market.id) && isRuleInEffect(rule, todayIso()),
                  ).length
                  return (
                    <li key={market.id}>
                      <Link to="/rules" className="entry entry--link">
                        <div>
                          <p className="entry__title">{market.name}</p>
                          <p className="entry__meta">
                            {pluralize(inEffect, 'regra vigente', 'regras vigentes')}
                          </p>
                        </div>
                        <span className="code">{market.code}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        )}
      </AsyncContent>
    </div>
  )
}
