export const enderecoApi = (import.meta.env?.VITE_API_URL ?? '/api').replace(/\/$/, '')

export async function requisitar(caminho, { metodo = 'GET', dados } = {}) {
  const formulario = dados instanceof FormData
  let resposta
  try {
    resposta = await fetch(`${enderecoApi}${caminho}`, {
      method: metodo,
      headers: dados !== undefined && !formulario ? { 'Content-Type': 'application/json' } : undefined,
      body: dados === undefined ? undefined : formulario ? dados : JSON.stringify(dados),
      signal: AbortSignal.timeout(60000),
      cache: 'no-store',
    })
  } catch (erro) {
    if (erro.name === 'TimeoutError' || erro.name === 'AbortError') {
      throw new Error('A API demorou para responder. Verifique o backend e tente novamente.')
    }
    throw new Error('Não foi possível conectar à API. Verifique se o backend está em execução.')
  }
  if (resposta.status === 204) return undefined
  let conteudo
  try {
    conteudo = await resposta.json()
  } catch {
    throw new Error('A API retornou uma resposta inválida. Verifique o backend.')
  }
  if (!resposta.ok) {
    throw new Error(conteudo.mensagem ?? `Não foi possível concluir a operação (${resposta.status}).`)
  }
  return conteudo
}

export async function listar(caminho) {
  const registros = []
  const separador = caminho.includes('?') ? '&' : '?'
  for (let pagina = 0; pagina < 100; pagina++) {
    const lote = await requisitar(`${caminho}${separador}pagina=${pagina}&tamanho=200`)
    if (!Array.isArray(lote)) throw new Error('A API retornou uma listagem inválida.')
    registros.push(...lote)
    if (lote.length < 200) return registros
  }
  throw new Error('A listagem excedeu o limite de 20000 registros. Consulte os dados por produto ou versão.')
}
