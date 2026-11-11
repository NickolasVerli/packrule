export const CATEGORIES = [
  'Cosméticos',
  'Limpeza',
  'Utilidades domésticas',
  'Brinquedos',
  'Eletrônicos',
  'Outros',
]

export const ALL_CATEGORIES = 'ALL'

export const RULE_TYPES = {
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

export const SEVERITIES = {
  CRITICAL: 'Critical',
  WARNING: 'Warning',
}

export const CLASSIFICATIONS = {
  CRITICAL: { label: 'Critical', order: 0, description: 'Deve ser revisado' },
  WARNING: { label: 'Warning', order: 1, description: 'Merece atenção' },
  MANUAL_REVIEW: { label: 'Manual Review', order: 2, description: 'Sem dados suficientes' },
  PASSED: { label: 'Passed', order: 3, description: 'Condição atendida' },
}

export const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

export const ACCEPTED_FILE_EXTENSIONS = '.pdf,.png,.jpg,.jpeg'

export const MAX_FILE_SIZE = 10 * 1024 * 1024
