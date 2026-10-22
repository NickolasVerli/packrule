import { rules } from './collections'
import { RULE_TYPES, SEVERITIES } from '../utils/constants'

function validate(data) {
  if (!data.title?.trim()) throw new Error('Informe o título da regra.')
  if (!data.description?.trim()) throw new Error('Informe a descrição da regra.')
  if (!RULE_TYPES[data.type]) throw new Error('Selecione o tipo da regra.')
  if (!SEVERITIES[data.severity]) throw new Error('Selecione a severidade da regra.')
  if (!data.marketIds?.length) throw new Error('Selecione ao menos um mercado.')
  if (!data.terms?.length) throw new Error('Informe ao menos um termo de verificação.')
  if (!data.startDate) throw new Error('Informe a data de início da vigência.')
  if (data.endDate && data.endDate < data.startDate) {
    throw new Error('A data final não pode ser anterior à data de início.')
  }
  if (!data.source?.trim()) throw new Error('Informe a fonte da regra.')
}

function normalize(data) {
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    type: data.type,
    terms: data.terms,
    marketIds: data.marketIds,
    category: data.category,
    severity: data.severity,
    startDate: data.startDate,
    endDate: data.endDate ?? '',
    source: data.source.trim(),
  }
}

export const ruleService = {
  list: async () => rules.list(),

  get: async (id) => {
    const rule = rules.find(id)
    if (!rule) throw new Error('Regra não encontrada.')
    return rule
  },

  create: async (data) => {
    validate(data)
    return rules.insert(normalize(data))
  },

  update: async (id, data) => {
    validate(data)
    return rules.update(id, normalize(data))
  },

  remove: async (id) => rules.remove(id),
}
