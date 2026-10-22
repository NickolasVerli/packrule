import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncContent } from '../../components/AsyncContent'
import { ClassificationBadge } from '../../components/ClassificationBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { isRuleInEffect } from '../../services/complianceEngine'
import { marketService } from '../../services/marketService'
import { ruleService } from '../../services/ruleService'
import { ALL_CATEGORIES, RULE_TYPES } from '../../utils/constants'
import { formatDate, pluralize, todayIso } from '../../utils/format'

function getRuleStatus(rule, today) {
  if (rule.startDate > today) return 'Futura'
  return isRuleInEffect(rule, today) ? 'Vigente' : 'Encerrada'
}

export function RuleListPage() {
  useDocumentTitle('Regras')
  const { notify } = useToast()
  const [marketFilter, setMarketFilter] = useState('')
  const [ruleToDelete, setRuleToDelete] = useState(null)
  const today = todayIso()

  const { data, loading, error, reload } = useAsync(async () => {
    const [rules, markets] = await Promise.all([ruleService.list(), marketService.list()])
    return { rules, markets }
  })

  const filtered = useMemo(() => {
    if (!data) return []
    return data.rules.filter((rule) => !marketFilter || rule.marketIds.includes(marketFilter))
  }, [data, marketFilter])

  async function handleDelete() {
    try {
      await ruleService.remove(ruleToDelete.id)
      notify('Regra excluída.')
      reload()
    } catch (err) {
      notify(err.message, 'error')
    }
    setRuleToDelete(null)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow={data ? pluralize(data.rules.length, 'regra', 'regras') : 'Base de conhecimento'}
        title="Regras de conformidade"
        description="Cada regra declara mercado, categoria, vigência e fonte. A data de referência da análise decide quais delas entram."
        actions={
          <Link to="/rules/new" className="btn">
            Nova regra
          </Link>
        }
      />

      <AsyncContent loading={loading} error={error}>
        {data && (
          <section className="section">
            <div className="filter-tabs" role="group" aria-label="Filtrar por mercado">
              <button
                type="button"
                className="filter-tab"
                aria-pressed={marketFilter === ''}
                onClick={() => setMarketFilter('')}
              >
                Todos
              </button>
              {data.markets.map((market) => (
                <button
                  key={market.id}
                  type="button"
                  className="filter-tab"
                  aria-pressed={marketFilter === market.id}
                  onClick={() => setMarketFilter(market.id)}
                >
                  {market.name}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="Nenhuma regra encontrada"
                description="Cadastre uma regra ou altere o filtro de mercado."
              />
            ) : (
              <ul className="entries">
                {filtered.map((rule) => (
                  <li key={rule.id} className="entry">
                    <div>
                      <Link
                        to={`/rules/${rule.id}/edit`}
                        className="entry__title"
                        style={{ textDecoration: 'none' }}
                      >
                        {rule.title}
                      </Link>
                      <p className="entry__meta">
                        {RULE_TYPES[rule.type].label} ·{' '}
                        {rule.category === ALL_CATEGORIES ? 'Todas as categorias' : rule.category} ·{' '}
                        {getRuleStatus(rule, today)} desde {formatDate(rule.startDate)}
                        {rule.endDate && ` até ${formatDate(rule.endDate)}`}
                      </p>
                      <p className="entry__meta">{rule.source}</p>
                    </div>
                    <div className="entry__side">
                      <div className="cluster" style={{ gap: 6 }}>
                        {rule.marketIds.map((marketId) => (
                          <span key={marketId} className="code">
                            {data.markets.find((market) => market.id === marketId)?.code}
                          </span>
                        ))}
                      </div>
                      <ClassificationBadge classification={rule.severity} />
                      <Link to={`/rules/${rule.id}/edit`} className="link-action">
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="link-action link-action--danger"
                        onClick={() => setRuleToDelete(rule)}
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </AsyncContent>

      <ConfirmDialog
        open={Boolean(ruleToDelete)}
        title="Excluir regra?"
        message={`“${ruleToDelete?.title ?? ''}” deixará de ser usada em novas análises. Análises anteriores continuam no histórico.`}
        confirmLabel="Excluir regra"
        onConfirm={handleDelete}
        onCancel={() => setRuleToDelete(null)}
      />
    </div>
  )
}
