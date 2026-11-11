import { CLASSIFICACOES } from './config.js'

export function formatarData(data) {
  if (!data) return '—'
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return dia + '/' + mes + '/' + ano
}

export function formatarDataHora(data) {
  if (!data) return '—'
  return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatarTamanho(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function dataAtual() {
  const hoje = new Date()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return hoje.getFullYear() + '-' + mes + '-' + dia
}

export function separarTermos(texto) {
  return texto.split(/[,\n]/).map(termo => termo.trim()).filter(Boolean)
}

export function pluralizar(quantidade, singular, plural) {
  return quantidade + ' ' + (quantidade === 1 ? singular : plural)
}

export function contarClassificacoes(achados) {
  const contagens = Object.fromEntries(Object.keys(CLASSIFICACOES).map(chave => [chave, 0]))
  for (const achado of achados) contagens[achado.classification] += 1
  return contagens
}

export function indexarPorId(lista) {
  return Object.fromEntries(lista.map(item => [item.id, item]))
}
