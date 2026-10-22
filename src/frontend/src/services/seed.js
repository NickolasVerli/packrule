export const INITIAL_MARKETS = [
  { id: 'market-fr', code: 'FR', name: 'França' },
  { id: 'market-de', code: 'DE', name: 'Alemanha' },
  { id: 'market-es', code: 'ES', name: 'Espanha' },
]

const ALL_MARKET_IDS = ['market-fr', 'market-de', 'market-es']

export const INITIAL_RULES = [
  {
    id: 'rule-gpsr-manufacturer',
    title: 'Identificação do fabricante ou importador',
    description:
      'A embalagem deve identificar o fabricante ou o importador responsável pelo produto no mercado europeu.',
    type: 'INFORMATION_PRESENCE',
    terms: ['fabricante', 'importador', 'fabricant', 'importateur', 'hersteller', 'importeur'],
    marketIds: ALL_MARKET_IDS,
    category: 'ALL',
    severity: 'CRITICAL',
    startDate: '2024-12-13',
    endDate: '',
    source: 'Regulamento (UE) 2023/988 (GPSR), art. 9',
  },
  {
    id: 'rule-gpsr-batch',
    title: 'Identificação do lote ou número de série',
    description:
      'O produto deve permitir sua identificação por lote, número de série ou elemento equivalente.',
    type: 'INFORMATION_PRESENCE',
    terms: ['lote', 'lot', 'batch', 'charge', 'serie', 'série'],
    marketIds: ALL_MARKET_IDS,
    category: 'ALL',
    severity: 'WARNING',
    startDate: '2024-12-13',
    endDate: '',
    source: 'Regulamento (UE) 2023/988 (GPSR), art. 9',
  },
  {
    id: 'rule-language-fr',
    title: 'Informações em francês',
    description: 'As informações da embalagem destinadas ao consumidor devem estar em francês.',
    type: 'LANGUAGE',
    terms: ['contenu', "mode d'emploi", 'fabriqué', 'à utiliser', 'précautions'],
    marketIds: ['market-fr'],
    category: 'ALL',
    severity: 'CRITICAL',
    startDate: '1994-08-04',
    endDate: '',
    source: 'Loi n.º 94-665 (Loi Toubon)',
  },
  {
    id: 'rule-language-de',
    title: 'Informações em alemão',
    description: 'As informações e avisos de segurança devem estar em alemão.',
    type: 'LANGUAGE',
    terms: ['inhalt', 'gebrauchsanweisung', 'hergestellt', 'hinweise', 'warnhinweis'],
    marketIds: ['market-de'],
    category: 'ALL',
    severity: 'CRITICAL',
    startDate: '2024-12-13',
    endDate: '',
    source: 'Regulamento (UE) 2023/988 (GPSR), art. 9',
  },
  {
    id: 'rule-language-es',
    title: 'Informações em espanhol',
    description: 'As informações e avisos de segurança devem estar em espanhol.',
    type: 'LANGUAGE',
    terms: ['contenido', 'instrucciones', 'fabricado', 'advertencias', 'modo de empleo'],
    marketIds: ['market-es'],
    category: 'ALL',
    severity: 'CRITICAL',
    startDate: '2024-12-13',
    endDate: '',
    source: 'Regulamento (UE) 2023/988 (GPSR), art. 9',
  },
  {
    id: 'rule-cosmetics-ingredients',
    title: 'Lista de ingredientes',
    description: 'Produtos cosméticos devem apresentar a lista de ingredientes na embalagem.',
    type: 'INFORMATION_PRESENCE',
    terms: ['ingredients', 'ingrédients', 'inhaltsstoffe', 'ingredientes', 'inci'],
    marketIds: ALL_MARKET_IDS,
    category: 'Cosméticos',
    severity: 'CRITICAL',
    startDate: '2013-07-11',
    endDate: '',
    source: 'Regulamento (CE) 1223/2009, art. 19',
  },
  {
    id: 'rule-ppwr-material',
    title: 'Material e orientação de descarte',
    description:
      'A embalagem deve indicar o material utilizado para apoiar a separação e a reciclagem.',
    type: 'INFORMATION_PRESENCE',
    terms: ['pet', 'hdpe', 'papel', 'cartão', 'vidro', 'recycl', 'recicl'],
    marketIds: ALL_MARKET_IDS,
    category: 'ALL',
    severity: 'WARNING',
    startDate: '2026-08-12',
    endDate: '',
    source: 'Regulamento (UE) 2025/40 (PPWR)',
  },
]

export const INITIAL_PRODUCTS = [
  {
    id: 'product-shampoo',
    name: 'Shampoo Hidratação Profunda 300 ml',
    category: 'Cosméticos',
    description: 'Shampoo para cabelos secos, produzido no Brasil para exportação à União Europeia.',
  },
]

export const INITIAL_VERSIONS = [
  {
    id: 'version-shampoo-1',
    productId: 'product-shampoo',
    number: 1,
    fileName: 'shampoo-300ml-v1.pdf',
    fileType: 'application/pdf',
    fileSize: 482304,
    material: 'PET reciclável',
    declaredQuantity: '300 ml',
    extractedText:
      "Shampoo Hidratação Profunda 300 ml. Fabricado por Cosméticos Aurora Ltda., Maringá, Brasil. Importador: Aurora Europe SARL, Paris. Lote: L2026-114. Ingredientes: Aqua, Sodium Laureth Sulfate, Glycerin. Contenu 300 ml. Mode d'emploi: appliquer sur cheveux mouillés. Embalagem PET reciclável.",
    uploadedAt: '2026-10-01T10:00:00.000Z',
  },
]
