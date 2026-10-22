import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncContent } from '../../components/AsyncContent'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { isRuleInEffect } from '../../services/complianceEngine'
import { marketService } from '../../services/marketService'
import { ruleService } from '../../services/ruleService'
import { ALL_CATEGORIES, RULE_TYPES } from '../../utils/constants'
import { formatDate, todayIso } from '../../utils/format'

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
        eyebrow="Base de conhecimento"
        title="Regras de conformidade"
        description="Cada regra declara mercado, categoria, vigência e fonte. A data de referência da análise decide quais delas entram."
        actions={
          <Link to="/rules/new" className="btn btn--accent">
            <Icon name="plus" /> Nova regra
          </Link>
        }
      />

      <AsyncContent loading={loading} error={error}>
        {data && (
          <>
            <div className="field" style={{ maxWidth: 260 }}>
              <label className="visually-hidden" htmlFor="rule-market">
                Filtrar por mercado
              </label>
              <select
                id="rule-market"
                className="select"
                value={marketFilter}
                onChange={(event) => setMarketFilter(event.target.value)}
              >
                <option value="">Todos os mercados</option>
                {data.markets.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="card">
              {filtered.length === 0 ? (
                <EmptyState
                  title="Nenhuma regra encontrada"
                  description="Cadastre uma regra ou altere o filtro de mercado."
                />
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Regra</th>
                        <th>Mercados</th>
                        <th>Categoria</th>
                        <th>Severidade</th>
                        <th>Vigência</th>
                        <th>
                          <span className="visually-hidden">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((rule) => (
                        <tr key={rule.id}>
                          <td>
                            <Link to={`/rules/${rule.id}/edit`} className="table__title">
                              {rule.title}
                            </Link>
                            <p className="list-row__meta">
                              {RULE_TYPES[rule.type].label} · {rule.source}
                            </p>
                          </td>
                          <td>
                            <div className="row" style={{ gap: 4 }}>
                              {rule.marketIds.map((marketId) => (
                                <span key={marketId} className="tag">
                                  {data.markets.find((m) => m.id === marketId)?.code}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>{rule.category === ALL_CATEGORIES ? 'Todas' : rule.category}</td>
                          <td>
                            <span className={`badge badge--${rule.severity.toLowerCase()}`}>
                              {rule.severity === 'CRITICAL' ? 'Critical' : 'Warning'}
                            </span>
                          </td>
                          <td>
                            <p>{getRuleStatus(rule, today)}</p>
                            <p className="list-row__meta">
                              desde {formatDate(rule.startDate)}
                              {rule.endDate && ` até ${formatDate(rule.endDate)}`}
                            </p>
                          </td>
                          <td>
                            <div className="table__actions">
                              <Link
                                to={`/rules/${rule.id}/edit`}
                                className="btn btn--ghost btn--small"
                              >
                                Editar
                              </Link>
                              <button
                                type="button"
                                className="btn btn--danger btn--small"
                                onClick={() => setRuleToDelete(rule)}
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
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
