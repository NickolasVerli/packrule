import { enderecoApi, listar, requisitar } from './servicos/api.js'
import { TAMANHO_MAXIMO } from './config.js'

const identificador = (id) => encodeURIComponent(id)

export const produtos = {
  listar: () => listar('/produtos'),
  buscar: (id) => requisitar(`/produtos/${identificador(id)}`),
  criar: (dados) => requisitar('/produtos', { metodo: 'POST', dados }),
  atualizar: (id, dados) => requisitar(`/produtos/${identificador(id)}`, { metodo: 'PUT', dados }),
  excluir: (id) => requisitar(`/produtos/${identificador(id)}`, { metodo: 'DELETE' }),
}

export const embalagens = {
  listarPorProduto: (produtoId) => listar(`/produtos/${identificador(produtoId)}/embalagens`),
  listarTodas: () => listar('/embalagens'),
  buscar: (id) => requisitar(`/embalagens/${identificador(id)}`),
  criar: async (produtoId, { file: arquivo, material, declaredQuantity: quantidade, extractedText: texto, launchDate: data }) => {
    if (!arquivo) throw new Error('Selecione o arquivo da embalagem.')
    if (arquivo.size > TAMANHO_MAXIMO) throw new Error('O arquivo excede o limite de 10 MB.')
    const formulario = new FormData()
    formulario.append('arquivo', arquivo)
    formulario.append('material', material ?? '')
    formulario.append('quantidadeDeclarada', quantidade ?? '')
    formulario.append('textoExtraido', texto ?? '')
    if (data) formulario.append('dataLancamento', data)
    return requisitar(`/produtos/${identificador(produtoId)}/embalagens`, { metodo: 'POST', dados: formulario })
  },
  atualizarTexto: (id, texto) => requisitar(`/embalagens/${identificador(id)}/texto`, {
    metodo: 'PATCH', dados: { extractedText: texto },
  }),
  enderecoArquivo: (id) => `${enderecoApi}/embalagens/${identificador(id)}/arquivo`,
  excluir: (id) => requisitar(`/embalagens/${identificador(id)}`, { metodo: 'DELETE' }),
}

function normalizarRegra(regra) {
  return { ...regra, endDate: regra.endDate ?? '' }
}

function dadosRegra(dados) {
  return { ...dados, endDate: dados.endDate || null }
}

export const regras = {
  listar: async () => (await listar('/regras')).map(normalizarRegra),
  buscar: async (id) => normalizarRegra(await requisitar(`/regras/${identificador(id)}`)),
  criar: async (dados) => normalizarRegra(await requisitar('/regras', { metodo: 'POST', dados: dadosRegra(dados) })),
  atualizar: async (id, dados) => normalizarRegra(await requisitar(`/regras/${identificador(id)}`, {
    metodo: 'PUT', dados: dadosRegra(dados),
  })),
  excluir: (id) => requisitar(`/regras/${identificador(id)}`, { metodo: 'DELETE' }),
}

export const mercados = { listar: () => requisitar('/mercados') }

export const analises = {
  listar: () => listar('/analises'),
  buscar: (id) => requisitar(`/analises/${identificador(id)}`),
  executar: (dados) => requisitar('/analises', { metodo: 'POST', dados }),
  excluir: (id) => requisitar(`/analises/${identificador(id)}`, { metodo: 'DELETE' }),
}
