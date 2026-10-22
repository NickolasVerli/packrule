import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { AsyncContent } from '../../components/AsyncContent'
import { FormField } from '../../components/FormField'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { marketService } from '../../services/marketService'
import { ruleService } from '../../services/ruleService'
import { ALL_CATEGORIES, CATEGORIES, RULE_TYPES, SEVERITIES } from '../../utils/constants'
import { parseTerms, todayIso } from '../../utils/format'

const EMPTY_RULE = {
  title: '',
  description: '',
  type: 'INFORMATION_PRESENCE',
  terms: [],
  marketIds: [],
  category: ALL_CATEGORIES,
  severity: 'CRITICAL',
  startDate: todayIso(),
  endDate: '',
  source: '',
}

export function RuleFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  useDocumentTitle(isEditing ? 'Editar regra' : 'Nova regra')

  const { data, loading, error } = useAsync(async () => {
    const [markets, rule] = await Promise.all([
      marketService.list(),
      isEditing ? ruleService.get(id) : EMPTY_RULE,
    ])
    return { markets, rule }
  }, [id])

  return (
    <div className="page">
      <PageHeader
        eyebrow="Regras"
        title={isEditing ? 'Editar regra' : 'Nova regra'}
        description="Toda regra precisa de uma fonte identificada para que o resultado seja rastreável."
      />
      <AsyncContent loading={loading} error={error}>
        {data && (
          <RuleForm key={id ?? 'new'} markets={data.markets} initialRule={data.rule} ruleId={id} />
        )}
      </AsyncContent>
    </div>
  )
}

function RuleForm({ markets, initialRule, ruleId }) {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [values, setValues] = useState({ ...initialRule, terms: initialRule.terms.join(', ') })
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function toggleMarket(marketId) {
    setValues((current) => ({
      ...current,
      marketIds: current.marketIds.includes(marketId)
        ? current.marketIds.filter((item) => item !== marketId)
        : [...current.marketIds, marketId],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    setSaving(true)
    const payload = { ...values, terms: parseTerms(values.terms) }
    try {
      if (ruleId) await ruleService.update(ruleId, payload)
      else await ruleService.create(payload)
      notify(ruleId ? 'Regra atualizada.' : 'Regra cadastrada.')
      navigate('/rules')
    } catch (err) {
      setSubmitError(err.message)
      setSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {submitError && <Alert tone="error">{submitError}</Alert>}

      <div className="form-grid">
        <FormField id="title" label="Título" className="form-grid__full">
          <input
            id="title"
            name="title"
            className="input"
            value={values.title}
            onChange={handleChange}
            required
          />
        </FormField>

        <FormField id="description" label="Descrição" className="form-grid__full">
          <textarea
            id="description"
            name="description"
            className="textarea"
            rows={3}
            value={values.description}
            onChange={handleChange}
            required
          />
        </FormField>

        <FormField id="type" label="Tipo" hint={RULE_TYPES[values.type]?.hint}>
          <select id="type" name="type" className="select" value={values.type} onChange={handleChange}>
            {Object.entries(RULE_TYPES).map(([key, type]) => (
              <option key={key} value={key}>
                {type.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="severity" label="Severidade" hint="Usada quando a regra não é atendida.">
          <select
            id="severity"
            name="severity"
            className="select"
            value={values.severity}
            onChange={handleChange}
          >
            {Object.entries(SEVERITIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="category" label="Categoria de produto">
          <select
            id="category"
            name="category"
            className="select"
            value={values.category}
            onChange={handleChange}
          >
            <option value={ALL_CATEGORIES}>Todas as categorias</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="source" label="Fonte" hint="Norma, artigo ou documento de origem.">
          <input
            id="source"
            name="source"
            className="input"
            value={values.source}
            onChange={handleChange}
            required
          />
        </FormField>

        <FormField
          id="terms"
          label="Termos de verificação"
          hint="Separe por vírgula ou quebra de linha. A busca ignora maiúsculas e acentos."
          className="form-grid__full"
        >
          <textarea
            id="terms"
            name="terms"
            className="textarea textarea--mono"
            rows={3}
            value={values.terms}
            onChange={handleChange}
            required
          />
        </FormField>

        <fieldset className="fieldset form-grid__full">
          <legend className="fieldset__legend">Mercados aplicáveis</legend>
          <div className="chips">
            {markets.map((market) => (
              <label key={market.id} className="chip">
                <input
                  type="checkbox"
                  className="visually-hidden"
                  checked={values.marketIds.includes(market.id)}
                  onChange={() => toggleMarket(market.id)}
                />
                {market.name}
                <code>{market.code}</code>
              </label>
            ))}
          </div>
        </fieldset>

        <FormField id="startDate" label="Início da vigência">
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="input"
            value={values.startDate}
            onChange={handleChange}
            required
          />
        </FormField>

        <FormField id="endDate" label="Fim da vigência" hint="Opcional. Deixe vazio se não há prazo final.">
          <input
            id="endDate"
            name="endDate"
            type="date"
            className="input"
            value={values.endDate}
            onChange={handleChange}
          />
        </FormField>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar regra'}
        </button>
        <Link to="/rules" className="link-action">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
