import { analyses, findings, products, rules, versions } from './collections'
import { runCompliance } from './complianceEngine'

function removeWhere(predicate) {
  const ids = analyses.list().filter(predicate).map((analysis) => analysis.id)
  findings.removeWhere((finding) => ids.includes(finding.analysisId))
  analyses.removeWhere(predicate)
}

export const analysisRepository = {
  removeByProduct: (productId) => removeWhere((analysis) => analysis.productId === productId),
  removeByVersion: (versionId) => removeWhere((analysis) => analysis.versionId === versionId),
}

function validate({ versionId, marketIds, referenceDate }) {
  if (!versionId) throw new Error('Selecione a versão da embalagem.')
  if (!marketIds?.length) throw new Error('Selecione ao menos um mercado.')
  if (!referenceDate) throw new Error('Informe a data de referência.')
}

function withFindings(analysis) {
  return { ...analysis, findings: findings.list().filter((f) => f.analysisId === analysis.id) }
}

export const analysisService = {
  list: async () =>
    analyses
      .list()
      .map(withFindings)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  get: async (id) => {
    const analysis = analyses.find(id)
    if (!analysis) throw new Error('Análise não encontrada.')
    return withFindings(analysis)
  },

  run: async ({ versionId, marketIds, referenceDate }) => {
    validate({ versionId, marketIds, referenceDate })

    const version = versions.find(versionId)
    if (!version) throw new Error('Versão da embalagem não encontrada.')
    const product = products.find(version.productId)
    if (!product) throw new Error('Produto não encontrado.')

    const results = runCompliance({
      product,
      version,
      rules: rules.list(),
      marketIds,
      referenceDate,
    })

    const analysis = analyses.insert({
      productId: product.id,
      versionId: version.id,
      marketIds,
      referenceDate,
      createdAt: new Date().toISOString(),
    })
    results.forEach((result) => findings.insert({ ...result, analysisId: analysis.id }))
    return withFindings(analysis)
  },

  remove: async (id) => {
    findings.removeWhere((finding) => finding.analysisId === id)
    analyses.remove(id)
  },
}
