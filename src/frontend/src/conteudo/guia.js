export const ETAPAS_GUIA = [
  {
    titulo: 'Cadastre um produto',
    descricao: 'Informe nome, categoria e descrição. A categoria ajuda a selecionar as regras da embalagem.',
    destino: '/products/new',
    acao: 'Cadastrar produto',
  },
  {
    titulo: 'Envie e revise a embalagem',
    descricao: 'Envie um PDF, PNG ou JPG de até 10 MB. Confira o texto extraído e complete o que faltar.',
    destino: '/products',
    acao: 'Abrir produtos',
  },
  {
    titulo: 'Confira as regras do mercado',
    descricao: 'Consulte ou cadastre os critérios de verificação, com termos, fonte e período de vigência.',
    destino: '/rules',
    acao: 'Consultar regras',
  },
  {
    titulo: 'Defina o contexto e analise',
    descricao: 'Escolha a versão da embalagem, os mercados de destino e a data usada para consultar as regras vigentes.',
    destino: '/analyses/new',
    acao: 'Iniciar análise',
  },
  {
    titulo: 'Revise os resultados',
    descricao: 'Leia a explicação e a fonte dos achados. Volte ao histórico para consultar a mesma análise depois.',
    destino: '/analyses',
    acao: 'Abrir histórico',
  },
]

export const RESULTADOS_GUIA = [
  {
    classificacao: 'CRITICAL',
    descricao: 'Um requisito importante não foi atendido e precisa ser revisado.',
  },
  {
    classificacao: 'WARNING',
    descricao: 'Um ponto da embalagem merece atenção e pode precisar de ajuste.',
  },
  {
    classificacao: 'MANUAL_REVIEW',
    descricao: 'Faltam informações para concluir. Confira o texto da embalagem.',
  },
  {
    classificacao: 'PASSED',
    descricao: 'A condição desta regra foi atendida com o texto analisado.',
  },
]

export const SECOES_PACKRULE = [
  {
    titulo: 'Produtos',
    descricao: 'Cadastre itens e organize suas versões de embalagem.',
    destino: '/products',
  },
  {
    titulo: 'Regras',
    descricao: 'Defina o que será verificado em cada mercado.',
    destino: '/rules',
  },
  {
    titulo: 'Nova análise',
    descricao: 'Verifique uma embalagem para os destinos escolhidos.',
    destino: '/analyses/new',
  },
  {
    titulo: 'Histórico',
    descricao: 'Reveja os resultados das análises já realizadas.',
    destino: '/analyses',
  },
]
