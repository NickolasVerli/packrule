import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { analises } from './dados.js'

let servidor
let elementos
let indicadores
let Avisos
let analise

before(async () => {
  const memoria = new Map()
  globalThis.localStorage = {
    getItem: chave => memoria.get(chave) ?? null,
    setItem: (chave, valor) => memoria.set(chave, valor),
  }
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
  test('renderiza ' + pagina + ' com os dados reais da rota ' + rota, async () => {
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
  })
}
