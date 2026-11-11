import { products } from './collections'
import { packagingRepository } from './packagingService'
import { analysisRepository } from './analysisService'

function validate({ name, category }) {
  if (!name?.trim()) throw new Error('Informe o nome do produto.')
  if (!category) throw new Error('Selecione a categoria do produto.')
}

function normalize({ name, category, description }) {
  return { name: name.trim(), category, description: (description ?? '').trim() }
}

export const productService = {
  list: async () => products.list(),

  get: async (id) => {
    const product = products.find(id)
    if (!product) throw new Error('Produto não encontrado.')
    return product
  },

  create: async (data) => {
    validate(data)
    return products.insert(normalize(data))
  },

  update: async (id, data) => {
    validate(data)
    return products.update(id, normalize(data))
  },

  remove: async (id) => {
    analysisRepository.removeByProduct(id)
    packagingRepository.removeByProduct(id)
    products.remove(id)
  },
}
