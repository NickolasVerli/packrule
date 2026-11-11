import { TODAS_CATEGORIAS } from './config.js'

export function regraVigente(regra, dataReferencia) {
  return regra.active !== false && regra.startDate <= dataReferencia &&
    (!regra.endDate || regra.endDate >= dataReferencia)
}

export function regraAplicavel(regra, produto, mercadoId, dataReferencia) {
  return regra.marketIds.includes(mercadoId) &&
    (regra.category === TODAS_CATEGORIAS || regra.category === produto.category) &&
    regraVigente(regra, dataReferencia)
}
