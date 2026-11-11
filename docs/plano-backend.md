# Plano de implementação do backend

## Objetivo e referências

Implementar os requisitos R01–R09 e RN01–RN12 da primeira entrega do PackRule, mantendo Java, Spring Boot, Spring Data JPA/Hibernate e PostgreSQL. Referências lidas: README, PDF e Markdown da primeira entrega, diretrizes gerais da AEP e diagramas de classes e banco em `docs`.

## Decisões

- API REST em `src/backend`, dividida em `controladores`, `servicos`, `repositorios`, `modelo`, `dto`, `conformidade`, `configuracao` e `excecoes`.
- Java 21 e Spring Boot 3.5.16. Maven gerencia versões das dependências; PostgreSQL é o banco da aplicação e dos testes de integração.
- Classes, métodos, variáveis e pacotes novos em português, sem comentários no código. Nomes padronizados do ecossistema são preservados.
- Rotas em português; propriedades JSON em inglês preservam o contrato das telas existentes.
- `Produto` compõe versões de embalagem; análises compõem achados. Arquivos são armazenados no PostgreSQL, com exclusão transacional e integridade referencial.
- Dados cadastrais de regras ficam na entidade `Regra`. A classe abstrata `RegraRegulatoria` e suas subclasses implementam a avaliação por polimorfismo, permitindo alterar o tipo de uma regra sem manipular discriminadores do Hibernate.
- PDFBox extrai texto de PDFs. Tesseract é opcional para imagens; PDFs digitalizados sem texto e ausência ou insuficiência de OCR exigem revisão do texto, explicitamente informada na resposta.
- Achados preservam título, fonte e evidência da regra no momento da análise. A exclusão de regras é lógica para manter sua rastreabilidade.
- Sem autenticação no escopo da primeira entrega. O servidor de desenvolvimento escuta somente em localhost.
- Branch atual `main`, conforme pedido. Três commits locais em inglês, sem prefixos e sem push.

## Etapas e verificações

### 1. Produtos e persistência

- [x] Criar Maven, configuração por ambiente, tratamento de erros e SQL em `/database`.
- [x] Implementar DTOs validados, entidades, repositórios, serviços e controladores de produtos e mercados.
- [x] Testar CRUD HTTP com PostgreSQL real, validação, identificador inexistente e compatibilidade do esquema com JPA.
- [x] Inspecionar diff e criar commit `Build the PostgreSQL product and market API`.

### 2. Embalagens, regras e análises

- [x] Testar upload real, numeração de versões, extração de PDF, revisão e download de arquivos.
- [x] Implementar CRUD de regras e avaliação por mercado, categoria e período de vigência.
- [x] Testar Critical, Warning, Passed e Manual Review, histórico imutável, exclusão e integridade referencial.
- [x] Implementar persistência dos arquivos, análises e achados; adicionar OCR opcional e validações de arquivos.
- [x] Executar testes e criar commit `Implement packaging uploads and compliance analysis`.

### 3. Integração e entrega

- [ ] Substituir a persistência local das telas por chamadas HTTP e remover a decisão de conformidade do cliente.
- [ ] Testar o adaptador HTTP e as telas; executar lint e build do frontend.
- [ ] Documentar ambiente, endpoints, execução e correspondência com os critérios da AEP.
- [ ] Executar o backend e demonstrar persistência após reinício, além do fluxo produto → arquivo → análise → histórico → exclusão.
- [ ] Revisar o diff completo e criar commit `Connect the frontend to the API and document backend setup`.

## Casos que exigem atenção

1. Upload vazio, formato falsificado ou arquivo maior que 10 MB deve ser recusado antes de persistir.
2. Duas versões enviadas para o mesmo produto não podem receber o mesmo número; números excluídos não são reutilizados.
3. Datas fora da vigência, categorias e mercados incompatíveis não podem gerar verificações indevidas.
4. Editar texto ou uma regra não pode alterar análises já concluídas.
5. Excluir produto deve remover seus arquivos, versões, análises e achados sem deixar registros órfãos.

## Registro de execução

- Repositório inicialmente limpo em `3e1c7c0`; referências remotas atualizadas, sem divergência.
- GitHub CLI está sem autenticação válida; nenhuma issue ou PR será publicada nesta tarefa local.
- Maven e PostgreSQL não estão instalados como serviços; ferramentas temporárias e banco real de testes serão usados sem instalação global.
- Etapa 1: três testes falharam inicialmente por ausência dos endpoints (404); após implementação, `src/backend/mvnw.cmd -B -ntp test` passou com 3 testes, zero falhas, PostgreSQL 17.11 e validação do esquema pelo Hibernate. Execução em Java 27; compilação direcionada ao Java 21.
- Etapa 2: testes do fluxo inicialmente falharam pela ausência das rotas; a primeira execução completa passou com 12 testes e zero falhas. Inclui arquivos persistidos, exclusão em cascata, histórico preservado e dois uploads simultâneos com números distintos.
- Etapa 2 concluída: `src/backend/mvnw.cmd -B -ntp test` passou com 16 testes e zero falhas, incluindo quatro testes diretos da classe abstrata e suas subclasses. Tesseract não está instalado neste ambiente; o estado de revisão necessária sem OCR foi verificado.
