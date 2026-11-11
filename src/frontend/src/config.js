export const CATEGORIAS = [
  'Cosméticos',
  'Limpeza',
  'Utilidades domésticas',
  'Brinquedos',
  'Eletrônicos',
  'Outros',
]

export const TODAS_CATEGORIAS = 'ALL'

export const TIPOS_REGRA = {
  INFORMATION_PRESENCE: {
    label: 'Presença de informação',
    hint: 'Aprova quando o texto da embalagem contém ao menos um dos termos informados.',
    minimumMatches: 1,
  },
  LANGUAGE: {
    label: 'Idioma',
    hint: 'Aprova quando o texto da embalagem contém ao menos dois dos termos do idioma exigido.',
    minimumMatches: 2,
  },
}

export const SEVERIDADES = {
  CRITICAL: 'Crítico',
  WARNING: 'Atenção',
}

export const CLASSIFICACOES = {
  CRITICAL: { label: 'Crítico', order: 0, description: 'Deve ser revisado' },
  WARNING: { label: 'Atenção', order: 1, description: 'Merece atenção' },
  MANUAL_REVIEW: { label: 'Revisão manual', order: 2, description: 'Sem dados suficientes' },
  PASSED: { label: 'Aprovado', order: 3, description: 'Condição atendida' },
}

export const TIPOS_ARQUIVO = ['application/pdf', 'image/png', 'image/jpeg']

export const EXTENSOES_ARQUIVO = '.pdf,.png,.jpg,.jpeg'

export const TAMANHO_MAXIMO = 10 * 1024 * 1024
