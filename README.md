# PackRule - Pré-Verificação de Conformidade de Embalagens

Plataforma web acadêmica de pré-verificação de conformidade de embalagens, desenvolvida para a Atividade de Estudo Programada (AEP) do 4º Semestre (2026.2) de Análise e Desenvolvimento de Sistemas.

O projeto apoia o ODS 12 ao antecipar revisões e reduzir retrabalho e desperdício de embalagens. Os resultados são uma pré-verificação, sem certificação jurídica de comercialização.

## Tecnologias

- **Backend:** Java 21, Spring Boot 3.5.16, Spring Data JPA, Hibernate e Bean Validation.
- **Banco de dados:** PostgreSQL 17.11, com tabelas, relacionamentos e restrições em [database/schema.sql](database/schema.sql).
- **Frontend:** React 19, JavaScript e Vite, conectado à API REST.
- **Extração de texto:** Apache PDFBox 3.0.8 para PDFs e Tesseract opcional para imagens.
- **Testes:** JUnit, Spring Boot Test e PostgreSQL real; testes de interface e HTTP com Node.js.

## Execução rápida no Windows

Instale um JDK 21 ou 25 e Node.js 22.12 ou superior. Não é necessário instalar Maven ou PostgreSQL para o modo local: o comando abaixo baixa o Maven com verificação SHA-512 e inicia um PostgreSQL real no computador.

No primeiro terminal, a partir da raiz do repositório:

```powershell
cd src/backend
.\mvnw.cmd -Plocal spring-boot:test-run
```

No segundo terminal, também a partir da raiz:

```powershell
cd src/frontend
npm ci
npm run dev
```

Acesse **http://localhost:5173**. A API atende em **http://127.0.0.1:8080/api**. O banco local usa a porta **54329**, e seus dados permanecem em `.temporario/banco-local` após encerrar e reiniciar a aplicação. Os testes usam outro banco, temporário e isolado.

Cadastre um produto, uma regra e uma versão de embalagem; selecione os mercados e execute a análise. França, Alemanha e Espanha já são cadastrados na inicialização. Produtos e regras são cadastrados pelo usuário, sem simular persistência no navegador.

Para usar PostgreSQL instalado ou Docker, configurar OCR, consultar endpoints e entender os critérios da AEP, veja [o README do backend](src/backend/README.md). A organização das telas está no [README do frontend](src/frontend/README.md).

## Verificação

```powershell
cd src/backend
.\mvnw.cmd verify
```

```powershell
cd src/frontend
npm test
npm run lint
npm run build
```

## Requisitos do Sistema

Para o MVP da aplicação, foram definidos os seguintes requisitos essenciais:

* **R01 – Cadastro e gerenciamento de produtos:** O sistema deve permitir cadastrar, consultar, editar e excluir produtos, contendo pelo menos nome, categoria e descrição. Esse será o CRUD principal da aplicação e os dados deverão ser armazenados no banco de dados.
* **R02 – Cadastro de versões da embalagem:** O sistema deve permitir adicionar diferentes versões de embalagem a um produto, armazenando o número ou identificação da versão, nome do arquivo e data de envio. As versões anteriores não devem ser substituídas quando uma nova embalagem for adicionada.
* **R03 – Envio do arquivo da embalagem:** O sistema deve permitir enviar arquivos de embalagem nos formatos PDF, PNG ou JPG e relacionar cada arquivo ao produto e à versão correspondente.
* **R04 – Leitura básica do conteúdo:** O sistema deve permitir obter conteúdo textual básico da embalagem enviada para que essas informações possam ser utilizadas nas verificações. Quando a extração automática não for suficiente, o conteúdo deverá poder ser revisado antes da análise.
* **R05 – Seleção de mercados e data:** O sistema deve permitir selecionar um ou mais mercados suportados e informar uma data de referência para a análise da embalagem.
* **R06 – Cadastro e gerenciamento de regras:** O sistema deve permitir cadastrar, consultar, editar e excluir regras utilizadas nas verificações. Cada regra deverá possuir pelo menos título, descrição, tipo, mercado aplicável, categoria de produto, severidade, data de início da vigência e fonte.
* **R07 – Execução da análise:** O sistema deve permitir executar uma análise utilizando a versão de uma embalagem, os dados do produto, os mercados selecionados e a data de referência. O sistema deverá utilizar somente as regras compatíveis com o contexto da análise.
* **R08 – Apresentação dos resultados:** O sistema deve apresentar os resultados das verificações informando pelo menos a classificação, explicação, mercado relacionado e regra utilizada. Os resultados deverão utilizar as classificações Critical, Warning, Passed ou Manual Review.
* **R09 – Histórico de análises:** O sistema deve armazenar as análises realizadas e permitir consultar posteriormente os resultados vinculados ao produto e à versão da embalagem utilizada.

---

## Cronograma de Execução

O desenvolvimento do Packrule teve início em 3 de setembro de 2026, conforme a primeira entrega. O cronograma original é preservado abaixo.

| Data | Atividade | Responsável |
| :--- | :--- | :--- |
| **03/09/2026** | Definição e delimitação do escopo do projeto | José Luiz, Nickolas Verli e Gustavo Couto |
| **03/09/2026** | Levantamento das necessidades, requisitos e regras de negócio | José Luiz, Nickolas Verli e Gustavo Couto |
| **08/09/2026** | Modelagem e elaboração do Diagrama de Classes | José Luiz e Nickolas Verli |
| **08/09/2026** | Modelagem do banco de dados e elaboração do DER | Nickolas Verli e Gustavo Couto |
| **11/09/2026** | Criação e organização do repositório GitHub e README | Nickolas Verli |
| **11/09/2026** | Revisão e preparação do documento da 1ª entrega | José Luiz, Nickolas Verli e Gustavo Couto |
