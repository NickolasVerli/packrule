import { TODAS_CATEGORIAS, CLASSIFICACOES, TIPOS_REGRA } from './config.js'

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function regraVigente(regra, dataReferencia) {
  return regra.startDate <= dataReferencia && (!regra.endDate || regra.endDate >= dataReferencia)
}

export function regraAplicavel(regra, produto, mercadoId, dataReferencia) {
  return regra.marketIds.includes(mercadoId) &&
    (regra.category === TODAS_CATEGORIAS || regra.category === produto.category) &&
    regraVigente(regra, dataReferencia)
}

function avaliar(regra, texto) {
  if (!texto.trim()) {
    return {
      classification: 'MANUAL_REVIEW',
      explanation: 'Não há texto extraído da embalagem. Revise esta regra manualmente.',
    }
  }
  const base = normalizar(texto)
  const encontrados = regra.terms.filter((termo) => base.includes(normalizar(termo))).length
  if (encontrados >= TIPOS_REGRA[regra.type].minimumMatches) {
    return {
      classification: 'PASSED',
      explanation: `${encontrados} termo(s) da regra encontrado(s) no texto da embalagem.`,
    }
  }
  return {
    classification: regra.severity,
    explanation: regra.type === 'LANGUAGE'
      ? 'O texto da embalagem não indica o idioma exigido pelo mercado.'
      : 'Nenhum dos termos exigidos foi encontrado no texto da embalagem.',
  }
}

export function verificarEmbalagem({ product: produto, version: embalagem, rules: regras, marketIds: mercados, referenceDate: dataReferencia }) {
  return mercados.flatMap((mercadoId) => regras
    .filter((regra) => regraAplicavel(regra, produto, mercadoId, dataReferencia))
    .map((regra) => ({ ruleId: regra.id, marketId: mercadoId, ...avaliar(regra, embalagem.extractedText) })))
    .sort((a, b) => CLASSIFICACOES[a.classification].order - CLASSIFICACOES[b.classification].order)
}
