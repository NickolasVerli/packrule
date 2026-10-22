import { Link } from 'react-router-dom'
import { AsyncContent } from '../components/AsyncContent'
import { ColorBar } from '../components/ColorBar'
import { Icon } from '../components/Icon'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { analysisService } from '../services/analysisService'
import { isRuleInEffect } from '../services/complianceEngine'
import { packagingService } from '../services/packagingService'
import { productService } from '../services/productService'
import { ruleService } from '../services/ruleService'
import { countByClassification, indexById } from '../utils/analysis'
import { formatDateTime, todayIso } from '../utils/format'

export function DashboardPage() {
  useDocumentTitle()

  const { data, loading, error } = useAsync(async () => {
    const [products, versions, rules, analyses] = await Promise.all([
      productService.list(),
      packagingService.listAll(),
      ruleService.list(),
      analysisService.list(),
    ])
    return { products, versions, rules, analyses }
  })

  return (
    <div className="page">
      <section className="proof hero" aria-labelledby="hero-title">
        <div>
          <p className="page-header__eyebrow">Pré-verificação de embalagens</p>
          <h1 id="hero-title" className="hero__title">
            O que revisar antes de vender neste mercado?
          </h1>
          <p className="hero__formula" aria-label="Fluxo da análise">
            <span>Produto</span>
            <span className="hero__op">+</span>
            <span>Embalagem</span>
            <span className="hero__op">+</span>
            <span>Mercado</span>
            <span className="hero__op">+</span>
            <span>Data</span>
            <span className="hero__op">→</span>
            <span>Resultado</span>
          </p>
          <div className="row">
            <Link to="/analyses/new" className="btn btn--accent">
              <Icon name="play" size={16} /> Nova análise
            </Link>
            <Link to="/products" className="btn btn--ghost">
              Ver produtos
            </Link>
          </div>
        </div>

        <div className="hero__summary">
          <AsyncContent loading={loading} error={error}>
            {data && <ResultSummary analyses={data.analyses} />}
          </AsyncContent>
        </div>
      </section>

      <AsyncContent loading={loading} error={error}>
        {data && (
          <>
            <div className="stat-grid">
              <Link to="/products" className="stat">
                <span className="stat__value">{data.products.length}</span>
                <span className="stat__label">Produtos</span>
              </Link>
              <Link to="/products" className="stat">
                <span className="stat__value">{data.versions.length}</span>
                <span className="stat__label">Versões de embalagem</span>
              </Link>
              <Link to="/rules" className="stat">
                <span className="stat__value">
                  {data.rules.filter((rule) => isRuleInEffect(rule, todayIso())).length}
                </span>
                <span className="stat__label">Regras vigentes</span>
              </Link>
              <Link to="/analyses" className="stat">
                <span className="stat__value">{data.analyses.length}</span>
                <span className="stat__label">Análises</span>
              </Link>
            </div>

            <RecentAnalyses
              analyses={data.analyses.slice(0, 5)}
              products={indexById(data.products)}
            />
          </>
        )}
      </AsyncContent>
    </div>
  )
}

function ResultSummary({ analyses }) {
  const findings = analyses.flatMap((analysis) => analysis.findings)

  return (
    <>
      <h2 style={{ marginBottom: 16 }}>Resultados acumulados</h2>
      {findings.length === 0 ? (
        <p className="muted">
          Nenhum resultado ainda. Execute uma análise para ver a distribuição entre Critical, Warning,
          Manual Review e Passed.
        </p>
      ) : (
        <ColorBar counts={countByClassification(findings)} />
      )}
    </>
  )
}

function RecentAnalyses({ analyses, products }) {
  return (
    <section className="card" aria-labelledby="recent-title">
      <div className="card__header">
        <h2 id="recent-title">Análises recentes</h2>
        <Link to="/analyses" className="btn btn--ghost btn--small">
          Ver histórico
        </Link>
      </div>
      {analyses.length === 0 ? (
        <p className="card__body muted">Nenhuma análise executada ainda.</p>
      ) : (
        <ul>
          {analyses.map((analysis) => (
            <li key={analysis.id}>
              <Link to={`/analyses/${analysis.id}`} className="list-row">
                <div>
                  <p className="list-row__title">
                    {products[analysis.productId]?.name ?? 'Produto removido'}
                  </p>
                  <p className="list-row__meta">{formatDateTime(analysis.createdAt)}</p>
                </div>
                <div style={{ width: 200 }}>
                  <ColorBar counts={countByClassification(analysis.findings)} compact />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
