import assert from 'node:assert/strict'
import { after, before, mock, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { analises } from './dados.js'
import { MERCADOS_INICIAIS, PRODUTOS_INICIAIS, REGRAS_INICIAIS, EMBALAGENS_INICIAIS } from './dadosIniciais.js'

let servidor
let elementos
let indicadores
let Avisos
let analise

before(async () => {
  analise = {
    id: 'analise-renderizacao', productId: 'product-shampoo', versionId: 'version-shampoo-1',
    marketIds: ['market-fr'], referenceDate: '2026-11-11', createdAt: '2026-11-11T12:00:00Z',
    findings: [{
      id: 'achado-renderizacao', ruleId: REGRAS_INICIAIS[0].id, marketId: 'market-fr',
      classification: 'PASSED', explanation: 'Informação encontrada no texto da embalagem.',
      ruleTitle: REGRAS_INICIAIS[0].title, source: REGRAS_INICIAIS[0].source,
    }],
  }
  mock.method(globalThis, 'fetch', async (endereco, opcoes = {}) => {
    const caminho = new URL(endereco, 'http://localhost').pathname.replace(/^\/api/, '')
    let resposta
    if (caminho === '/analises' || caminho.startsWith('/analises/')) {
      resposta = caminho === '/analises' && opcoes.method !== 'POST' ? [analise] : analise
    }
    if (caminho === '/mercados') resposta = MERCADOS_INICIAIS
    if (caminho === '/produtos') resposta = PRODUTOS_INICIAIS
    if (caminho.startsWith('/produtos/')) {
      const produtoId = caminho.split('/')[2]
      resposta = caminho.endsWith('/embalagens')
        ? EMBALAGENS_INICIAIS.filter((versao) => versao.productId === produtoId)
        : PRODUTOS_INICIAIS.find((produto) => produto.id === produtoId)
    }
    if (caminho === '/embalagens') resposta = EMBALAGENS_INICIAIS
    if (caminho.startsWith('/embalagens/')) resposta = EMBALAGENS_INICIAIS.find((versao) => versao.id === caminho.split('/')[2])
    if (caminho === '/regras') resposta = REGRAS_INICIAIS
    if (caminho.startsWith('/regras/')) resposta = REGRAS_INICIAIS.find((regra) => regra.id === caminho.split('/')[2])
    return new Response(JSON.stringify(resposta ?? { mensagem: 'Registro não encontrado.' }), { status: resposta ? 200 : 404 })
  })
  analise = await analises.executar({
    versionId: 'version-shampoo-1', marketIds: ['market-fr'], referenceDate: '2026-11-11',
  })
  servidor = await createServer({
    configFile: false,
    plugins: [
      {
        name: 'dados-para-renderizacao',
        enforce: 'pre',
        load(id) {
          if (id.endsWith('/src/hooks.js')) {
            return `
              export function useTitulo() {}
              export function useDados(carregar) {
                const teste = globalThis.renderizacaoPackrule
                if (teste.capturando) teste.carregadores.push(carregar)
                return { dados: teste.dados, carregando: teste.capturando, erro: null, recarregar() {} }
              }
            `
          }
        },
      },
      react(),
    ],
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
  })
  elementos = await servidor.ssrLoadModule('/src/componentes/Elementos.jsx')
  indicadores = await servidor.ssrLoadModule('/src/componentes/Indicadores.jsx')
  Avisos = (await servidor.ssrLoadModule('/src/componentes/Avisos.jsx')).Avisos
})

after(async () => {
  await servidor?.close()
  mock.restoreAll()
  delete globalThis.renderizacaoPackrule
})

test('carregamento mantém o papel ARIA reconhecido por leitores de tela', () => {
  const html = renderToStaticMarkup(createElement(elementos.Conteudo, { carregando: true }))
  assert.match(html, /role="status"/)
  assert.match(html, /Carregando/)
})

test('falhas de carregamento são anunciadas como alertas', () => {
  const html = renderToStaticMarkup(createElement(elementos.Conteudo, { erro: 'Falha ao carregar' }))
  assert.match(html, /role="alert"/)
  assert.match(html, /Falha ao carregar/)
})

test('resultados mostram rótulos em português sem mudar os códigos de classificação', () => {
  for (const [codigo, rotulo] of [
    ['CRITICAL', 'Crítico'], ['WARNING', 'Atenção'], ['PASSED', 'Aprovado'],
    ['MANUAL_REVIEW', 'Revisão manual'],
  ]) {
    const html = renderToStaticMarkup(createElement(indicadores.SeloClassificacao, { classificacao: codigo }))
    assert.ok(html.includes(rotulo))
    assert.ok(html.includes('situacao--' + codigo.toLowerCase()))
  }
})

for (const [pagina, rota, endereco, esperado] of [
  ['Painel', '/', '/', 'Resumo das análises'],
  ['Produtos', '/products', '/products', 'Shampoo Hidratação Profunda'],
  ['CadastroProduto', '/products/new', '/products/new', 'Salvar produto'],
  ['CadastroProduto', '/products/:id/edit', '/products/product-shampoo/edit', 'Shampoo Hidratação Profunda'],
  ['DetalhesProduto', '/products/:id', '/products/product-shampoo', 'shampoo-300ml-v1.pdf'],
  ['CadastroEmbalagem', '/products/:productId/versions/new', '/products/product-shampoo/versions/new', 'Escolher arquivo'],
  ['DetalhesEmbalagem', '/versions/:id', '/versions/version-shampoo-1', 'Importador: Aurora Europe'],
  ['Regras', '/rules', '/rules', 'Identificação do fabricante'],
  ['CadastroRegra', '/rules/new', '/rules/new', 'Salvar regra'],
  ['CadastroRegra', '/rules/:id/edit', '/rules/rule-language-fr/edit', 'Informações em francês'],
  ['NovaAnalise', '/analyses/new', '/analyses/new?version=version-shampoo-1', 'shampoo-300ml-v1.pdf'],
  ['Historico', '/analyses', '/analyses', 'Shampoo Hidratação Profunda'],
  ['ResultadoAnalise', '/analyses/:id', null, 'Identificação do fabricante'],
  ['NaoEncontrada', '*', '/pagina-inexistente', 'Página não encontrada'],
]) {
  test('renderiza ' + pagina + ' com o contrato da API na rota ' + rota, async () => {
    const modulo = await servidor.ssrLoadModule('/src/paginas/' + pagina + '.jsx')
    const teste = { capturando: true, dados: null, carregadores: [] }
    globalThis.renderizacaoPackrule = teste
    function renderizar() {
      return renderToStaticMarkup(createElement(MemoryRouter,
        { initialEntries: [endereco ?? '/analyses/' + analise.id] },
        createElement(Avisos, null,
          createElement(Routes, null,
            createElement(Route, { path: rota, element: createElement(modulo[pagina]) }),
          ),
        ),
      ))
    }
    renderizar()
    if (teste.carregadores.length) teste.dados = await teste.carregadores[0]()
    teste.capturando = false
    const html = renderizar()
    assert.ok(html.includes(esperado), pagina + ': conteúdo da página não foi renderizado')
    assert.ok(!html.includes('Manual Review'))
    assert.ok(!html.includes('Compliance Facts'))
    if (pagina === 'DetalhesEmbalagem') assert.ok(html.includes('/api/embalagens/version-shampoo-1/arquivo'))
    if (pagina === 'CadastroRegra' || pagina === 'NovaAnalise') assert.ok(html.includes('Brasil'))
  })
}

test('resultado preserva o título e a fonte de uma regra excluída', async () => {
  const modulo = await servidor.ssrLoadModule('/src/paginas/ResultadoAnalise.jsx')
  const historica = {
    ...analise,
    findings: [{ ...analise.findings[0], ruleTitle: 'Título histórico', source: 'Fonte histórica' }],
  }
  globalThis.renderizacaoPackrule = {
    capturando: false,
    dados: {
      analise: historica, produto: PRODUTOS_INICIAIS[0], versao: EMBALAGENS_INICIAIS[0],
      mercados: Object.fromEntries(MERCADOS_INICIAIS.map((mercado) => [mercado.id, mercado])), regras: {},
    },
  }
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(modulo.ResultadoAnalise)))
  assert.ok(html.includes('Título histórico'))
  assert.ok(html.includes('Fonte histórica'))
  assert.ok(!html.includes('Regra removida'))
})

for (const pagina of ['Painel', 'Historico']) {
  test(pagina + ' preserva o nome do produto registrado na análise', async () => {
    const modulo = await servidor.ssrLoadModule('/src/paginas/' + pagina + '.jsx')
    const historica = { ...analise, productName: 'Nome preservado na análise' }
    globalThis.renderizacaoPackrule = {
      capturando: false,
      dados: {
        produtos: Object.fromEntries(PRODUTOS_INICIAIS.map((produto) => [produto.id, { ...produto, name: 'Nome atual alterado' }])),
        regras: REGRAS_INICIAIS, analises: [historica],
        versoes: Object.fromEntries(EMBALAGENS_INICIAIS.map((versao) => [versao.id, versao])),
        mercados: pagina === 'Painel' ? MERCADOS_INICIAIS
          : Object.fromEntries(MERCADOS_INICIAIS.map((mercado) => [mercado.id, mercado])),
      },
    }
    const html = renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(Avisos, null, createElement(modulo[pagina]))))
    assert.ok(html.includes('Nome preservado na análise'))
  })
}
