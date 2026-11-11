# PackRule - Pré-verificação de conformidade de embalagens

O PackRule permite cadastrar produtos, enviar versões de embalagens e analisar seu conteúdo conforme as regras de cada mercado. Os resultados ficam disponíveis no histórico. Os mercados atendidos são Alemanha, Brasil, Espanha e França.

Projeto da AEP do 4º semestre de Análise e Desenvolvimento de Sistemas, alinhado ao ODS 12 pela redução de retrabalho e desperdício de embalagens.

## Executar no Windows

Requisitos: JDK 21 ou 25 e Node.js 22.12 ou superior, com npm.

Abra dois terminais na raiz do projeto. No primeiro, inicie o backend:

```powershell
.\src\backend\mvnw.cmd -Plocal spring-boot:test-run
```

No segundo, inicie o frontend:

```powershell
cd src/frontend
npm ci
npm run dev
```

Acesse http://localhost:5173. Mantenha os dois terminais abertos e use `Ctrl+C` para encerrar. Os dados são mantidos entre execuções.

### Leitura de imagens

Para habilitar a extração de texto de PNG e JPG, execute na raiz do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/configurar-ocr.ps1
```

Reinicie o backend após a configuração.

## Organização

| Pasta | Conteúdo |
| :--- | :--- |
| [src](src/README.md) | Código-fonte |
| [src/backend](src/backend/README.md) | API e análise das embalagens |
| [src/frontend](src/frontend/README.md) | Interface do sistema |
| [database](database) | Scripts do banco de dados |
| [docs](docs) | Documentação e diagramas |
| [scripts](scripts) | Configuração do ambiente |

## Requisitos do Sistema

* **R01 – Cadastro e gerenciamento de produtos:** O sistema deve permitir cadastrar, consultar, editar e excluir produtos, contendo pelo menos nome, categoria e descrição. Esse será o CRUD principal da aplicação e os dados deverão ser armazenados no banco de dados.
* **R02 – Cadastro de versões da embalagem:** O sistema deve permitir adicionar diferentes versões de embalagem a um produto, armazenando o número ou identificação da versão, nome do arquivo e data de envio. As versões anteriores não devem ser substituídas quando uma nova embalagem for adicionada.
* **R03 – Envio do arquivo da embalagem:** O sistema deve permitir enviar arquivos de embalagem nos formatos PDF, PNG ou JPG e relacionar cada arquivo ao produto e à versão correspondente.
* **R04 – Leitura básica do conteúdo:** O sistema deve permitir obter conteúdo textual básico da embalagem enviada para que essas informações possam ser utilizadas nas verificações. Quando a extração automática não for suficiente, o conteúdo deverá poder ser revisado antes da análise.
* **R05 – Seleção de mercados e data:** O sistema deve permitir selecionar um ou mais mercados suportados e informar uma data de referência para a análise da embalagem.
* **R06 – Cadastro e gerenciamento de regras:** O sistema deve permitir cadastrar, consultar, editar e excluir regras utilizadas nas verificações. Cada regra deverá possuir pelo menos título, descrição, tipo, mercado aplicável, categoria de produto, severidade, data de início da vigência e fonte.
* **R07 – Execução da análise:** O sistema deve permitir executar uma análise utilizando a versão de uma embalagem, os dados do produto, os mercados selecionados e a data de referência. O sistema deverá utilizar somente as regras compatíveis com o contexto da análise.
* **R08 – Apresentação dos resultados:** O sistema deve apresentar os resultados das verificações informando pelo menos a classificação, explicação, mercado relacionado e regra utilizada. Os resultados deverão utilizar as classificações Critical, Warning, Passed ou Manual Review.
* **R09 – Histórico de análises:** O sistema deve armazenar as análises realizadas e permitir consultar posteriormente os resultados vinculados ao produto e à versão da embalagem utilizada.

## Cronograma de Execução

### 1ª entrega

| Data | Atividade | Responsável |
| :--- | :--- | :--- |
| **03/09/2026** | Definição e delimitação do escopo do projeto | José Luiz, Nickolas Verli e Gustavo Couto |
| **03/09/2026** | Levantamento das necessidades, requisitos e regras de negócio | José Luiz, Nickolas Verli e Gustavo Couto |
| **08/09/2026** | Modelagem e elaboração do Diagrama de Classes | José Luiz e Nickolas Verli |
| **08/09/2026** | Modelagem do banco de dados e elaboração do DER | Nickolas Verli e Gustavo Couto |
| **11/09/2026** | Criação e organização do repositório GitHub e README | Nickolas Verli |
| **11/09/2026** | Revisão e preparação do documento da 1ª entrega | José Luiz, Nickolas Verli e Gustavo Couto |

### 2ª entrega — Cronograma

| Data | Atividade | Responsável |
| :--- | :--- | :--- |
| **18/09/2026** | Preparação do ambiente e configuração do backend | José Luiz e Nickolas Verli |
| **25/09/2026** | Criação das tabelas e configuração da conexão com o PostgreSQL | Nickolas Verli e Gustavo Couto |
| **02/10/2026** | Implementação do cadastro, consulta, edição e exclusão de produtos | José Luiz |
| **09/10/2026** | Envio de arquivos e controle das versões de embalagem | José Luiz e Gustavo Couto |
| **16/10/2026** | Cadastro de regras por mercado, categoria e período de vigência | Nickolas Verli e Gustavo Couto |
| **23/10/2026** | Implementação do motor de análise, com herança e polimorfismo nas regras | José Luiz e Nickolas Verli |
| **30/10/2026** | Integração das telas com a API e consulta do histórico de análises | Nickolas Verli |
| **06/11/2026** | Configuração da leitura de PDFs e imagens e da revisão de texto | José Luiz e Gustavo Couto |
| **11/11/2026** | Testes de integração e revisão dos READMEs | José Luiz, Nickolas Verli e Gustavo Couto |
| **13/11/2026** | Revisão final | José Luiz, Nickolas Verli e Gustavo Couto |
