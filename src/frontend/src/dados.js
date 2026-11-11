import { MERCADOS_INICIAIS, PRODUTOS_INICIAIS, REGRAS_INICIAIS, EMBALAGENS_INICIAIS } from './dadosIniciais.js'
import { TIPOS_ARQUIVO, TAMANHO_MAXIMO, TIPOS_REGRA, SEVERIDADES } from './config.js'
import { verificarEmbalagem } from './verificacao.js'

const iniciais = {
  markets: MERCADOS_INICIAIS,
  products: PRODUTOS_INICIAIS,
  versions: EMBALAGENS_INICIAIS,
  rules: REGRAS_INICIAIS,
  analyses: [],
  findings: [],
}

function salvar(nome, registros) {
  localStorage.setItem(`packrule:${nome}`, JSON.stringify(registros))
}

function ler(nome) {
  const salvo = localStorage.getItem(`packrule:${nome}`)
  if (salvo) {
    try {
      const registros = JSON.parse(salvo)
      if (registros !== null) return registros
    } catch (erro) {
      if (!(erro instanceof SyntaxError)) throw erro
    }
  }
  salvar(nome, iniciais[nome])
  return structuredClone(iniciais[nome])
}

function buscar(nome, id, mensagem) {
  const registro = ler(nome).find((item) => item.id === id)
  if (!registro) throw new Error(mensagem)
  return registro
}

function inserir(nome, dados) {
  const registro = { ...dados, id: crypto.randomUUID() }
  salvar(nome, [...ler(nome), registro])
  return registro
}

function atualizar(nome, id, dados) {
  const registros = ler(nome)
  const atualizado = { ...registros.find((item) => item.id === id), ...dados, id }
  salvar(nome, registros.map((item) => item.id === id ? atualizado : item))
  return atualizado
}

function excluirOnde(nome, condicao) {
  salvar(nome, ler(nome).filter((item) => !condicao(item)))
}

function excluirAnalises(condicao) {
  const ids = ler('analyses').filter(condicao).map((item) => item.id)
  excluirOnde('findings', (item) => ids.includes(item.analysisId))
  excluirOnde('analyses', condicao)
}

function prepararProduto({ name: nome, category: categoria, description: descricao }) {
  if (!nome?.trim()) throw new Error('Informe o nome do produto.')
  if (!categoria) throw new Error('Selecione a categoria do produto.')
  return { name: nome.trim(), category: categoria, description: (descricao ?? '').trim() }
}

export const produtos = {
  listar: async () => ler('products'),
  buscar: async (id) => buscar('products', id, 'Produto não encontrado.'),
  criar: async (dados) => inserir('products', prepararProduto(dados)),
  atualizar: async (id, dados) => atualizar('products', id, prepararProduto(dados)),
  excluir: async (id) => {
    excluirAnalises((item) => item.productId === id)
    excluirOnde('versions', (item) => item.productId === id)
    excluirOnde('products', (item) => item.id === id)
  },
}

function listarEmbalagens(produtoId) {
  return ler('versions').filter((item) => item.productId === produtoId).sort((a, b) => b.number - a.number)
}

export const embalagens = {
  listarPorProduto: async (produtoId) => listarEmbalagens(produtoId),
  listarTodas: async () => ler('versions'),
  buscar: async (id) => buscar('versions', id, 'Versão da embalagem não encontrada.'),
  criar: async (produtoId, { file: arquivo, material, declaredQuantity: quantidade, extractedText: texto }) => {
    if (!arquivo) throw new Error('Selecione o arquivo da embalagem.')
    if (!TIPOS_ARQUIVO.includes(arquivo.type)) throw new Error('Formato inválido. Envie um arquivo PDF, PNG ou JPG.')
    if (arquivo.size > TAMANHO_MAXIMO) throw new Error('O arquivo excede o limite de 10 MB.')
    return inserir('versions', {
      productId: produtoId,
      number: (listarEmbalagens(produtoId)[0]?.number ?? 0) + 1,
      fileName: arquivo.name,
      fileType: arquivo.type,
      fileSize: arquivo.size,
      material: (material ?? '').trim(),
      declaredQuantity: (quantidade ?? '').trim(),
      extractedText: (texto ?? '').trim(),
      uploadedAt: new Date().toISOString(),
    })
  },
  atualizarTexto: async (id, texto) => atualizar('versions', id, { extractedText: texto.trim() }),
  excluir: async (id) => {
    excluirAnalises((item) => item.versionId === id)
    excluirOnde('versions', (item) => item.id === id)
  },
}

function prepararRegra(dados) {
  if (!dados.title?.trim()) throw new Error('Informe o título da regra.')
  if (!dados.description?.trim()) throw new Error('Informe a descrição da regra.')
  if (!TIPOS_REGRA[dados.type]) throw new Error('Selecione o tipo da regra.')
  if (!SEVERIDADES[dados.severity]) throw new Error('Selecione a severidade da regra.')
  if (!dados.marketIds?.length) throw new Error('Selecione ao menos um mercado.')
  if (!dados.terms?.length) throw new Error('Informe ao menos um termo de verificação.')
  if (!dados.startDate) throw new Error('Informe a data de início da vigência.')
  if (dados.endDate && dados.endDate < dados.startDate) throw new Error('A data final não pode ser anterior à data de início.')
  if (!dados.source?.trim()) throw new Error('Informe a fonte da regra.')
  return {
    title: dados.title.trim(),
    description: dados.description.trim(),
    type: dados.type,
    terms: dados.terms,
    marketIds: dados.marketIds,
    category: dados.category,
    severity: dados.severity,
    startDate: dados.startDate,
    endDate: dados.endDate ?? '',
    source: dados.source.trim(),
  }
}

export const regras = {
  listar: async () => ler('rules'),
  buscar: async (id) => buscar('rules', id, 'Regra não encontrada.'),
  criar: async (dados) => inserir('rules', prepararRegra(dados)),
  atualizar: async (id, dados) => atualizar('rules', id, prepararRegra(dados)),
  excluir: async (id) => excluirOnde('rules', (item) => item.id === id),
}

export const mercados = { listar: async () => ler('markets') }

function comResultados(analise, resultados) {
  return { ...analise, findings: resultados.filter((item) => item.analysisId === analise.id) }
}

export const analises = {
  listar: async () => {
    const resultados = ler('findings')
    return ler('analyses').map((item) => comResultados(item, resultados))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  buscar: async (id) => comResultados(buscar('analyses', id, 'Análise não encontrada.'), ler('findings')),
  executar: async ({ versionId: embalagemId, marketIds: mercadosIds, referenceDate: dataReferencia }) => {
    if (!embalagemId) throw new Error('Selecione a versão da embalagem.')
    if (!mercadosIds?.length) throw new Error('Selecione ao menos um mercado.')
    if (!dataReferencia) throw new Error('Informe a data de referência.')
    const embalagem = buscar('versions', embalagemId, 'Versão da embalagem não encontrada.')
    const produto = buscar('products', embalagem.productId, 'Produto não encontrado.')
    const resultados = verificarEmbalagem({
      product: produto, version: embalagem, rules: ler('rules'), marketIds: mercadosIds, referenceDate: dataReferencia,
    })
    const analise = inserir('analyses', {
      productId: produto.id, versionId: embalagem.id, marketIds: mercadosIds,
      referenceDate: dataReferencia, createdAt: new Date().toISOString(),
    })
    resultados.forEach((resultado) => inserir('findings', { ...resultado, analysisId: analise.id }))
    return comResultados(analise, ler('findings'))
  },
  excluir: async (id) => excluirAnalises((item) => item.id === id),
}
