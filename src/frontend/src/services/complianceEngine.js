import { ALL_CATEGORIES, CLASSIFICATIONS, RULE_TYPES } from '../utils/constants'

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function countMatches(text, terms) {
  const base = normalize(text)
  return terms.filter((term) => base.includes(normalize(term))).length
}

export function isRuleInEffect(rule, referenceDate) {
  if (rule.startDate > referenceDate) return false
  if (rule.endDate && rule.endDate < referenceDate) return false
  return true
}

export function isRuleApplicable(rule, product, marketId, referenceDate) {
  const categoryMatches = rule.category === ALL_CATEGORIES || rule.category === product.category
  return (
    rule.marketIds.includes(marketId) &&
    categoryMatches &&
    isRuleInEffect(rule, referenceDate)
  )
}

function evaluate(rule, extractedText) {
  if (!extractedText.trim()) {
    return {
      classification: 'MANUAL_REVIEW',
      explanation: 'Não há texto extraído da embalagem. Revise esta regra manualmente.',
    }
  }

  const matches = countMatches(extractedText, rule.terms)

  if (matches >= RULE_TYPES[rule.type].minimumMatches) {
    return {
      classification: 'PASSED',
      explanation: `${matches} termo(s) da regra encontrado(s) no texto da embalagem.`,
    }
  }

  return {
    classification: rule.severity,
    explanation:
      rule.type === 'LANGUAGE'
        ? 'O texto da embalagem não indica o idioma exigido pelo mercado.'
        : 'Nenhum dos termos exigidos foi encontrado no texto da embalagem.',
  }
}

export function runCompliance({ product, version, rules, marketIds, referenceDate }) {
  const results = marketIds.flatMap((marketId) =>
    rules
      .filter((rule) => isRuleApplicable(rule, product, marketId, referenceDate))
      .map((rule) => ({ ruleId: rule.id, marketId, ...evaluate(rule, version.extractedText) })),
  )

  return results.sort(
    (a, b) => CLASSIFICATIONS[a.classification].order - CLASSIFICATIONS[b.classification].order,
  )
}
