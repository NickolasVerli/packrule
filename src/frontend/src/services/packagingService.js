import { versions } from './collections'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/constants'
import { analysisRepository } from './analysisService'

function validateFile(file) {
  if (!file) throw new Error('Selecione o arquivo da embalagem.')
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    throw new Error('Formato inválido. Envie um arquivo PDF, PNG ou JPG.')
  }
  if (file.size > MAX_FILE_SIZE) throw new Error('O arquivo excede o limite de 10 MB.')
}

function listByProduct(productId) {
  return versions
    .list()
    .filter((version) => version.productId === productId)
    .sort((a, b) => b.number - a.number)
}

export const packagingRepository = {
  removeByProduct: (productId) =>
    versions.removeWhere((version) => version.productId === productId),
}

export const packagingService = {
  listByProduct: async (productId) => listByProduct(productId),

  listAll: async () => versions.list(),

  get: async (id) => {
    const version = versions.find(id)
    if (!version) throw new Error('Versão da embalagem não encontrada.')
    return version
  },

  create: async (productId, { file, material, declaredQuantity, extractedText }) => {
    validateFile(file)
    const latest = listByProduct(productId)[0]
    return versions.insert({
      productId,
      number: (latest?.number ?? 0) + 1,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      material: (material ?? '').trim(),
      declaredQuantity: (declaredQuantity ?? '').trim(),
      extractedText: (extractedText ?? '').trim(),
      uploadedAt: new Date().toISOString(),
    })
  },

  updateText: async (id, extractedText) =>
    versions.update(id, { extractedText: extractedText.trim() }),

  remove: async (id) => {
    analysisRepository.removeByVersion(id)
    versions.remove(id)
  },
}
