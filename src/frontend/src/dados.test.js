import { beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { produtos, embalagens, regras, mercados, analises } from './dados.js'
import { regraVigente, regraAplicavel, verificarEmbalagem } from './verificacao.js'
import { CLASSIFICACOES, SEVERIDADES, TAMANHO_MAXIMO } from './config.js'

beforeEach(() => {
  const memoria = new Map()
  globalThis.localStorage = {
    getItem: (chave) => memoria.get(chave) ?? null,
    setItem: (chave, valor) => memoria.set(chave, String(valor)),
  }
})

const produtoValido = { name: ' Sabão ', category: 'Limpeza', description: ' Descrição ' }
const arquivoValido = { name: 'rotulo.pdf', type: 'application/pdf', size: 100 }
const regraValida = {
  title: ' Fabricante ', description: ' Identificar fabricante ', type: 'INFORMATION_PRESENCE',
  terms: ['fabricante'], marketIds: ['market-fr'], category: 'ALL', severity: 'CRITICAL',
  startDate: '2024-01-01', endDate: '', source: ' Fonte ',
}

test('mantém os dados iniciais e as chaves já usadas pelo navegador', async () => {
  assert.equal((await produtos.listar())[0].id, 'product-shampoo')
  assert.equal((await embalagens.listarTodas())[0].id, 'version-shampoo-1')
  assert.equal((await regras.listar()).length, 7)
  assert.equal((await mercados.listar()).length, 3)
  assert.deepEqual(await analises.listar(), [])
  for (const chave of ['products', 'versions', 'rules', 'markets', 'analyses', 'findings']) {
    assert.ok(Array.isArray(JSON.parse(localStorage.getItem(`packrule:${chave}`))))
  }
})

test('produtos validam, normalizam e persistem alterações', async () => {
  await assert.rejects(produtos.criar({ ...produtoValido, name: ' ' }), /nome/)
  await assert.rejects(produtos.criar({ ...produtoValido, category: '' }), /categoria/)
  const criado = await produtos.criar(produtoValido)
  assert.equal(criado.name, 'Sabão')
  assert.equal(criado.description, 'Descrição')
  const atualizado = await produtos.atualizar(criado.id, { ...produtoValido, name: ' Novo ' })
  assert.equal(atualizado.name, 'Novo')
  assert.deepEqual(await produtos.buscar(criado.id), atualizado)
  await produtos.excluir(criado.id)
  await assert.rejects(produtos.buscar(criado.id), /não encontrado/)
})

test('carrega registros existentes sem substituir campos ou identificadores', async () => {
  const existentes = [{ id: 'antigo', name: 'Salvo', category: 'Outros', description: 'Pessoal' }]
  localStorage.setItem('packrule:products', JSON.stringify(existentes))
  assert.deepEqual(await produtos.listar(), existentes)
  assert.equal(JSON.parse(localStorage.getItem('packrule:products'))[0].id, 'antigo')
  assert.deepEqual(await produtos.buscar('antigo'), existentes[0])
})

test('reabre histórico antigo com versões e resultados intactos e ordena por data', async () => {
  const produto = { id: 'salvo-produto', name: 'Sabão salvo', category: 'Limpeza', description: 'Descrição antiga' }
  const embalagem = {
    id: 'salva-versao', productId: produto.id, number: 4, fileName: 'salvo.png',
    fileType: 'image/png', fileSize: 420, material: 'Papel', declaredQuantity: '200 g',
    extractedText: 'Fabricante antigo', uploadedAt: '2025-01-01T10:00:00.000Z',
  }
  const regra = { ...regraValida, id: 'salva-regra' }
  const mercado = { id: 'market-fr', code: 'FR', name: 'França' }
  const antiga = {
    id: 'salva-analise', productId: produto.id, versionId: embalagem.id,
    marketIds: [mercado.id], referenceDate: '2025-01-01', createdAt: '2025-01-01T12:00:00.000Z',
  }
  const recente = { ...antiga, id: 'recente-analise', createdAt: '2025-01-02T12:00:00.000Z' }
  const resultado = {
    id: 'salvo-resultado', analysisId: antiga.id, ruleId: regra.id, marketId: mercado.id,
    classification: 'PASSED', explanation: '1 termo(s) da regra encontrado(s) no texto da embalagem.',
  }
  for (const [chave, registros] of [
    ['products', [produto]], ['versions', [embalagem]], ['rules', [regra]], ['markets', [mercado]],
    ['analyses', [antiga, recente]], ['findings', [resultado]],
  ]) localStorage.setItem(`packrule:${chave}`, JSON.stringify(registros))
  assert.deepEqual(await produtos.listar(), [produto])
  assert.deepEqual(await embalagens.listarTodas(), [embalagem])
  assert.deepEqual(await regras.listar(), [regra])
  assert.deepEqual(await mercados.listar(), [mercado])
  assert.deepEqual(await analises.listar(), [{ ...recente, findings: [] }, { ...antiga, findings: [resultado] }])
  await regras.excluir(regra.id)
  assert.deepEqual(await regras.listar(), [])
  assert.deepEqual(await analises.buscar(antiga.id), { ...antiga, findings: [resultado] })
})

test('preserva versões anteriores e ordena novas versões pelo número', async () => {
  const primeira = await embalagens.buscar('version-shampoo-1')
  const nova = await embalagens.criar(primeira.productId, {
    file: arquivoValido, material: ' PET ', declaredQuantity: ' 300 ml ', extractedText: ' Texto ',
  })
  assert.equal(nova.number, 2)
  assert.equal(nova.fileName, arquivoValido.name)
  assert.equal(nova.fileType, arquivoValido.type)
  assert.equal(nova.fileSize, arquivoValido.size)
  assert.equal(nova.material, 'PET')
  assert.equal(nova.declaredQuantity, '300 ml')
  assert.equal(nova.extractedText, 'Texto')
  assert.deepEqual((await embalagens.listarPorProduto(primeira.productId)).map((item) => item.id), [nova.id, primeira.id])
  await embalagens.atualizarTexto(nova.id, ' Alterado ')
  assert.equal((await embalagens.buscar(nova.id)).extractedText, 'Alterado')
  assert.deepEqual(await embalagens.buscar(primeira.id), primeira)
})

test('embalagens aceitam PDF, PNG, JPEG e o limite exato de 10 MB', async () => {
  for (const type of ['application/pdf', 'image/png', 'image/jpeg']) {
    const criada = await embalagens.criar('product-shampoo', { file: { ...arquivoValido, type, size: TAMANHO_MAXIMO } })
    assert.equal(criada.fileType, type)
    assert.equal(criada.extractedText, '')
  }
  await assert.rejects(embalagens.criar('product-shampoo', {}), /Selecione o arquivo/)
  await assert.rejects(embalagens.criar('product-shampoo', { file: { ...arquivoValido, type: 'text/plain' } }), /Formato inválido/)
  await assert.rejects(embalagens.criar('product-shampoo', { file: { ...arquivoValido, size: TAMANHO_MAXIMO + 1 } }), /10 MB/)
})

test('regras validam os campos obrigatórios e o intervalo de vigência', async () => {
  const invalidos = [
    ['title', ''], ['description', ''], ['type', 'OUTRO'], ['severity', 'OUTRO'],
    ['marketIds', []], ['terms', []], ['startDate', ''], ['source', ''], ['endDate', '2023-01-01'],
  ]
  for (const [campo, valor] of invalidos) {
    await assert.rejects(regras.criar({ ...regraValida, [campo]: valor }))
  }
  const criada = await regras.criar(regraValida)
  assert.equal(criada.title, 'Fabricante')
  assert.equal(criada.description, 'Identificar fabricante')
  assert.equal(criada.source, 'Fonte')
  await regras.atualizar(criada.id, { ...regraValida, title: 'Nova regra' })
  assert.equal((await regras.buscar(criada.id)).title, 'Nova regra')
  await regras.excluir(criada.id)
  await assert.rejects(regras.buscar(criada.id), /não encontrada/)
})

test('vigência inclui os dias de início e fim e permite prazo aberto', () => {
  const regra = { ...regraValida, endDate: '2024-12-31' }
  assert.equal(regraVigente(regra, '2023-12-31'), false)
  assert.equal(regraVigente(regra, '2024-01-01'), true)
  assert.equal(regraVigente(regra, '2024-12-31'), true)
  assert.equal(regraVigente(regra, '2025-01-01'), false)
  assert.equal(regraVigente(regraValida, '2030-01-01'), true)
})

test('aplicabilidade combina categoria, mercado e vigência', () => {
  const produto = { category: 'Limpeza' }
  assert.equal(regraAplicavel(regraValida, produto, 'market-fr', '2025-01-01'), true)
  assert.equal(regraAplicavel(regraValida, produto, 'market-de', '2025-01-01'), false)
  assert.equal(regraAplicavel({ ...regraValida, category: 'Cosméticos' }, produto, 'market-fr', '2025-01-01'), false)
  assert.equal(regraAplicavel({ ...regraValida, category: 'Limpeza' }, produto, 'market-fr', '2025-01-01'), true)
  assert.equal(regraAplicavel(regraValida, produto, 'market-fr', '2023-01-01'), false)
})

test('verificação produz e ordena os quatro resultados e ignora acentos e caixa', () => {
  const verificar = (texto, lista) => verificarEmbalagem({
    product: { category: 'Limpeza' }, version: { extractedText: texto }, rules: lista,
    marketIds: ['market-fr'], referenceDate: '2025-01-01',
  })
  const lista = [
    { ...regraValida, id: 'aprovada', terms: ['fábricante'] },
    { ...regraValida, id: 'aviso', terms: ['lote'], severity: 'WARNING' },
    { ...regraValida, id: 'critica', terms: ['endereço'] },
  ]
  assert.deepEqual(verificar('FABRICANTE', lista).map((item) => item.classification), ['CRITICAL', 'WARNING', 'PASSED'])
  assert.deepEqual(verificar(' ', lista).map((item) => item.classification), ['MANUAL_REVIEW', 'MANUAL_REVIEW', 'MANUAL_REVIEW'])
  assert.equal(verificar('FABRICANTE', lista)[2].ruleId, 'aprovada')
  assert.equal(verificar('FABRICANTE', lista)[2].marketId, 'market-fr')
})

test('regra de idioma exige dois termos e filtra mercados selecionados', () => {
  const executar = (texto) => verificarEmbalagem({
    product: { category: 'Limpeza' }, version: { extractedText: texto },
    rules: [{ ...regraValida, id: 'idioma', type: 'LANGUAGE', terms: ['contenu', 'fabriqué'] }],
    marketIds: ['market-fr', 'market-de'], referenceDate: '2025-01-01',
  })
  assert.equal(executar('contenu')[0].classification, 'CRITICAL')
  assert.equal(executar('contenu fabrique')[0].classification, 'PASSED')
  assert.equal(executar('contenu fabrique').length, 1)
})

test('análises guardam o histórico e hidratam findings persistidos', async () => {
  const parametros = { versionId: 'version-shampoo-1', marketIds: ['market-fr'], referenceDate: '2026-10-01' }
  const criada = await analises.executar(parametros)
  assert.ok(criada.findings.length)
  assert.ok(criada.findings.every((item) => item.analysisId === criada.id && item.id))
  assert.deepEqual(await analises.buscar(criada.id), criada)
  const original = criada.findings
  await embalagens.atualizarTexto(parametros.versionId, '')
  assert.deepEqual((await analises.buscar(criada.id)).findings, original)
  const outra = await analises.executar(parametros)
  assert.ok(outra.findings.every((item) => item.classification === 'MANUAL_REVIEW'))
  assert.equal((await analises.listar()).length, 2)
  await analises.excluir(criada.id)
  assert.equal((await analises.listar()).length, 1)
  assert.ok(JSON.parse(localStorage.getItem('packrule:findings')).every((item) => item.analysisId === outra.id))
  await assert.rejects(analises.buscar(criada.id), /não encontrada/)
})

test('análises rejeitam seleção incompleta e referências inexistentes', async () => {
  const parametros = { versionId: 'version-shampoo-1', marketIds: ['market-fr'], referenceDate: '2026-10-01' }
  for (const incompleto of [{ versionId: '' }, { marketIds: [] }, { referenceDate: '' }, { versionId: 'inexistente' }]) {
    await assert.rejects(analises.executar({ ...parametros, ...incompleto }))
  }
  localStorage.setItem('packrule:products', '[]')
  await assert.rejects(analises.executar(parametros), /Produto não encontrado/)
})

test('excluir versão elimina apenas suas análises e resultados', async () => {
  const nova = await embalagens.criar('product-shampoo', { file: arquivoValido })
  const criarAnalise = (versionId) => analises.executar({ versionId, marketIds: ['market-fr'], referenceDate: '2026-10-01' })
  const removida = await criarAnalise(nova.id)
  const preservada = await criarAnalise('version-shampoo-1')
  await embalagens.excluir(nova.id)
  await assert.rejects(embalagens.buscar(nova.id), /não encontrada/)
  await assert.rejects(analises.buscar(removida.id), /não encontrada/)
  assert.deepEqual(await analises.buscar(preservada.id), preservada)
  assert.ok(JSON.parse(localStorage.getItem('packrule:findings')).every((item) => item.analysisId === preservada.id))
})

test('excluir produto elimina suas versões, análises e resultados', async () => {
  await analises.executar({ versionId: 'version-shampoo-1', marketIds: ['market-fr'], referenceDate: '2026-10-01' })
  const outro = await produtos.criar(produtoValido)
  await produtos.excluir('product-shampoo')
  assert.deepEqual(await embalagens.listarPorProduto('product-shampoo'), [])
  assert.deepEqual(await analises.listar(), [])
  assert.deepEqual(JSON.parse(localStorage.getItem('packrule:findings')), [])
  assert.equal((await produtos.buscar(outro.id)).id, outro.id)
})

test('rótulos de classificação ficam em português com códigos compatíveis', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(CLASSIFICACOES).map(([codigo, valor]) => [codigo, valor.label])), {
    CRITICAL: 'Crítico', WARNING: 'Atenção', MANUAL_REVIEW: 'Revisão manual', PASSED: 'Aprovado',
  })
  assert.deepEqual(SEVERIDADES, { CRITICAL: 'Crítico', WARNING: 'Atenção' })
})
