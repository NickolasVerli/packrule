import { afterEach, beforeEach, mock, test } from 'node:test'
import assert from 'node:assert/strict'
import { produtos, embalagens, regras, mercados, analises } from './dados.js'
import { regraVigente, regraAplicavel } from './verificacao.js'
import { CLASSIFICACOES, SEVERIDADES } from './config.js'

let requisicoes
let responder

beforeEach(() => {
  requisicoes = []
  responder = () => new Response(JSON.stringify({ id: 'registro' }), { headers: { 'Content-Type': 'application/json' } })
  mock.method(globalThis, 'fetch', async (endereco, opcoes = {}) => {
    requisicoes.push({ endereco, opcoes })
    return responder(endereco, opcoes)
  })
  globalThis.localStorage = {
    getItem() { throw new Error('A persistência deve utilizar a API.') },
    setItem() { throw new Error('A persistência deve utilizar a API.') },
  }
})

afterEach(() => {
  mock.restoreAll()
  delete globalThis.localStorage
})

test('produtos utilizam POST, GET, PUT e DELETE na API', async () => {
  const dados = { name: 'Sabão', category: 'Limpeza', description: 'Produto de teste' }
  await produtos.criar(dados)
  await produtos.buscar('produto')
  await produtos.atualizar('produto', dados)
  responder = () => new Response(null, { status: 204 })
  await produtos.excluir('produto')
  assert.deepEqual(requisicoes.map(({ endereco, opcoes }) => [endereco, opcoes.method]), [
    ['/api/produtos', 'POST'], ['/api/produtos/produto', 'GET'],
    ['/api/produtos/produto', 'PUT'], ['/api/produtos/produto', 'DELETE'],
  ])
  assert.deepEqual(JSON.parse(requisicoes[0].opcoes.body), dados)
})

test('listagens percorrem as páginas do servidor', async () => {
  responder = (endereco) => {
    const pagina = Number(new URL(endereco, 'http://localhost').searchParams.get('pagina'))
    const registros = pagina === 0
      ? Array.from({ length: 200 }, (_, indice) => ({ id: String(indice) }))
      : [{ id: 'ultimo' }]
    return new Response(JSON.stringify(registros))
  }
  const registros = await produtos.listar()
  assert.equal(registros.length, 201)
  assert.equal(registros.at(-1).id, 'ultimo')
  assert.equal(requisicoes.length, 2)
})

test('envio de embalagem transmite o arquivo e os campos multipart', async () => {
  const arquivo = new File(['%PDF-1.7'], 'rotulo.pdf', { type: 'application/pdf' })
  await embalagens.criar('produto', {
    file: arquivo, material: 'Papel', declaredQuantity: '100 g', extractedText: 'Fabricante PackRule',
  })
  const { endereco, opcoes } = requisicoes[0]
  assert.equal(endereco, '/api/produtos/produto/embalagens')
  assert.equal(opcoes.method, 'POST')
  assert.ok(opcoes.body instanceof FormData)
  assert.equal(opcoes.body.get('arquivo').name, 'rotulo.pdf')
  assert.equal(opcoes.body.get('quantidadeDeclarada'), '100 g')
  assert.equal(opcoes.body.get('textoExtraido'), 'Fabricante PackRule')
  assert.ok(!opcoes.headers?.['Content-Type'])
})

test('revisão do texto usa PATCH e o arquivo tem endereço de download', async () => {
  await embalagens.atualizarTexto('versao', 'Conteúdo revisado')
  assert.equal(requisicoes[0].endereco, '/api/embalagens/versao/texto')
  assert.equal(requisicoes[0].opcoes.method, 'PATCH')
  assert.deepEqual(JSON.parse(requisicoes[0].opcoes.body), { extractedText: 'Conteúdo revisado' })
  assert.equal(embalagens.enderecoArquivo('versao'), '/api/embalagens/versao/arquivo')
})

test('cadastro de regras aceita vigência sem data final e normaliza a resposta', async () => {
  responder = () => new Response(JSON.stringify({ id: 'regra', endDate: null }))
  const regra = await regras.criar({ title: 'Regra', endDate: '' })
  assert.equal(regra.endDate, '')
  assert.equal(JSON.parse(requisicoes[0].opcoes.body).endDate, null)
})

test('análises enviam o contexto para avaliação no servidor', async () => {
  const contexto = { versionId: 'versao', marketIds: ['mercado'], referenceDate: '2026-11-11' }
  await analises.executar(contexto)
  assert.equal(requisicoes[0].endereco, '/api/analises')
  assert.equal(requisicoes[0].opcoes.method, 'POST')
  assert.deepEqual(JSON.parse(requisicoes[0].opcoes.body), contexto)
})

test('erros de validação do servidor são apresentados ao usuário', async () => {
  responder = () => new Response(JSON.stringify({ mensagem: 'Informe a fonte da regra.' }), { status: 400 })
  await assert.rejects(regras.criar({}), /Informe a fonte da regra/)
})

test('indisponibilidade do backend gera uma mensagem de conexão', async () => {
  responder = () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(mercados.listar(), /backend|API/)
})

test('resposta inválida da API gera erro explícito', async () => {
  responder = () => new Response('<html>Erro do proxy</html>')
  await assert.rejects(produtos.buscar('produto'), /resposta inválida/)
})

test('identificadores são codificados antes de compor o endereço', async () => {
  await produtos.buscar('parte/outra')
  assert.equal(requisicoes[0].endereco, '/api/produtos/parte%2Foutra')
})

test('filtros visuais respeitam vigência inclusiva e regras desativadas', () => {
  const regra = { marketIds: ['fr'], category: 'ALL', startDate: '2026-01-01', endDate: '2026-12-31', active: true }
  assert.equal(regraVigente(regra, '2026-01-01'), true)
  assert.equal(regraVigente(regra, '2027-01-01'), false)
  assert.equal(regraAplicavel(regra, { category: 'Limpeza' }, 'fr', '2026-12-31'), true)
  assert.equal(regraAplicavel({ ...regra, active: false }, { category: 'Limpeza' }, 'fr', '2026-12-31'), false)
})

test('rótulos de classificação ficam em português com códigos compatíveis', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(CLASSIFICACOES).map(([codigo, valor]) => [codigo, valor.label])), {
    CRITICAL: 'Crítico', WARNING: 'Atenção', MANUAL_REVIEW: 'Revisão manual', PASSED: 'Aprovado',
  })
  assert.deepEqual(SEVERIDADES, { CRITICAL: 'Crítico', WARNING: 'Atenção' })
})
