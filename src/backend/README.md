# PackRule · Backend

API REST em Java 21 e Spring Boot 3.5.16, com PostgreSQL, JPA/Hibernate e validação de entrada. Implementa os requisitos R01–R09 e as regras de negócio RN01–RN12 da primeira entrega.

## Executar no Windows

Requisito: JDK 21 ou 25 no `PATH` ou em `JAVA_HOME`. Os comandos a seguir são executados dentro de `src/backend`.

```powershell
.\mvnw.cmd -Plocal spring-boot:test-run
```

Esse modo inicia a API em `http://127.0.0.1:8080` e um **PostgreSQL 17.11 real** na porta `54329`. Os dados ficam em `.temporario/banco-local`, na raiz do repositório, e são reutilizados nas próximas execuções. O banco e a API são encerrados com `Ctrl+C`. O modo local usa a classe de desenvolvimento em `src/test`; ela não faz parte do JAR da aplicação.

O wrapper baixa o Maven 3.9.11 para `.ferramentas` e verifica seu SHA-512. Dependências e binários do PostgreSQL são baixados na primeira execução. Quem já possui Maven pode substituir `.\mvnw.cmd` por `mvn`.

## PostgreSQL instalado ou Docker

Como alternativa ao modo local, copie `.env.example` para `.env` na raiz, defina `BANCO_SENHA` e ajuste `BANCO_URL` e `BANCO_USUARIO` se necessário. O Spring lê esse arquivo ao iniciar.

Com Docker Desktop em execução, na raiz:

```powershell
docker compose up -d banco
```

Em `src/backend`, inicie a API sem o perfil local:

```powershell
.\mvnw.cmd spring-boot:run
```

Para PostgreSQL instalado, crie o banco `packrule` e um usuário com permissão para criar as tabelas nesse banco. Configure a conexão no `.env` e use o mesmo comando acima. Não há H2 nem persistência em listas.

## Banco e integridade

`/database/schema.sql` cria o esquema de forma idempotente, e `/database/dados-iniciais.sql` cadastra os três mercados. Os mesmos arquivos são incluídos no JAR e executados antes da validação do modelo pelo Hibernate (`ddl-auto=validate`). O esquema não é apagado ou recriado a cada inicialização.

As tabelas seguem o DER: `produto`, `versao_embalagem`, `mercado`, `regra_regulatoria`, `analise_conformidade`, `achado`, `regra_mercado` e `analise_mercado`. `regra_termo` armazena os termos ordenados e `arquivo_embalagem` armazena o arquivo binário, evitando carregar arquivos ao listar versões.

A numeração de versões utiliza um contador persistido no produto e bloqueio transacional. Números excluídos não são reutilizados. Excluir produto remove suas versões, arquivos, análises e achados. Excluir uma regra a oculta de novas consultas e análises, preservando o vínculo com os resultados históricos.

## Organização e POO

```text
src/main/java/br/com/packrule/
├── controladores/    HTTP, validação e respostas
├── servicos/         operações e transações
├── repositorios/     consultas JPA
├── modelo/           entidades, composição e enums
├── dto/              dados de entrada e saída
├── conformidade/     seleção e avaliação de regras
├── configuracao/     CORS
└── excecoes/         erros padronizados
```

- **Abstração:** `conformidade/RegraRegulatoria.java` declara `avaliar` como método abstrato.
- **Herança:** `RegraPresencaInformacao` e `RegraIdioma` estendem essa classe.
- **Polimorfismo:** ambas sobrescrevem `avaliar` com `@Override`. `MotorConformidade` usa referências `RegraRegulatoria` para executar o comportamento correto.
- **Encapsulamento:** atributos privados, métodos de alteração e coleções retornadas como cópias.
- **Composição 1:N:** `Produto` possui versões e `AnaliseConformidade` possui achados, com cascata e remoção de órfãos.

`Regra` é a entidade persistida que guarda os dados regulatórios. A hierarquia abstrata representa sua avaliação, permitindo editar o tipo da regra sem alterar discriminadores de herança no banco.

## Endpoints

As rotas são em português. As propriedades JSON mantêm os nomes usados pelo frontend existente. Identificadores são UUIDs.

| Método | Rota | Operação |
| :--- | :--- | :--- |
| GET / POST | `/api/produtos` | Listar / cadastrar produtos |
| GET / PUT / DELETE | `/api/produtos/{id}` | Consultar / editar / excluir produto |
| GET | `/api/mercados` | Listar mercados |
| GET / POST | `/api/produtos/{id}/embalagens` | Listar versões / enviar arquivo |
| GET | `/api/embalagens` | Listar versões |
| GET / DELETE | `/api/embalagens/{id}` | Consultar / excluir versão |
| GET | `/api/embalagens/{id}/arquivo` | Baixar arquivo original |
| PATCH | `/api/embalagens/{id}/texto` | Revisar texto extraído |
| GET / POST | `/api/regras` | Listar / cadastrar regras |
| GET / PUT / DELETE | `/api/regras/{id}` | Consultar / editar / excluir regra |
| GET / POST | `/api/analises` | Consultar histórico / executar análise |
| GET / DELETE | `/api/analises/{id}` | Consultar / excluir análise |

Listagens de produtos, embalagens, regras e análises aceitam `pagina` (a partir de zero) e `tamanho` (1–200, padrão 100), retornando arrays JSON. O histórico aceita `produtoId` ou `versaoId`. O frontend percorre as páginas automaticamente.

Cadastrar ou atualizar produto:

```json
{"name":"Sabão","category":"Limpeza","description":"Produto para demonstração"}
```

Opcionais: `sku` e `status` (`ATIVO` ou `INATIVO`). Nome e categoria são obrigatórios; o SKU informado deve ser único.

Cadastrar ou atualizar regra:

```json
{
  "title":"Identificação do fabricante",
  "description":"Verificar a informação no texto revisado",
  "type":"INFORMATION_PRESENCE",
  "terms":["fabricante","fabricant"],
  "marketIds":["00000000-0000-0000-0000-000000000001"],
  "category":"ALL",
  "severity":"CRITICAL",
  "startDate":"2026-01-01",
  "endDate":null,
  "source":"Exemplo acadêmico do planejamento do PackRule"
}
```

`type` aceita `INFORMATION_PRESENCE` ou `LANGUAGE`; `severity` aceita `CRITICAL` ou `WARNING`. `category` recebe a categoria do produto ou `ALL`. Fonte, mercados, termos e início da vigência são obrigatórios. `active`, `code` e `expectedLanguage` são opcionais. Regras de idioma exigem pelo menos dois termos distintos.

O upload usa `multipart/form-data`: `arquivo` é obrigatório; `material`, `quantidadeDeclarada`, `textoExtraido` e `dataLancamento` são opcionais. O servidor calcula o número da versão. A revisão usa:

```json
{"extractedText":"Texto revisado da embalagem"}
```

Executar análise:

```json
{
  "versionId":"UUID retornado no cadastro da embalagem",
  "marketIds":["00000000-0000-0000-0000-000000000001"],
  "referenceDate":"2026-11-11"
}
```

Os achados contêm classificação, explicação, evidência, mercado, identificador, título e fonte da regra. Título, fonte, texto analisado e contexto do produto são preservados no momento da análise. Alterações posteriores não reescrevem o histórico.

Respostas: `201` para criação, `200` para consulta/alteração, `204` para exclusão, `400` para dados inválidos, `404` para recurso inexistente, `409` para conflito de integridade e `413` para arquivos acima do limite. Erros usam `mensagem` e `campos`; detalhes internos não são enviados ao navegador.

## Extração de texto e OCR

Arquivos aceitos: PDF, PNG e JPG, até 10 MB. A extensão, o tipo e o conteúdo são verificados. PDFs devem estar sem senha e ter até 20 páginas; imagens podem ter até 25 milhões de pixels. O texto revisado tem limite de 50000 caracteres.

PDFs com texto são lidos com PDFBox. PDFs digitalizados sem texto exigem preenchimento manual. Para OCR em imagens, instale Tesseract e os idiomas desejados e configure no `.env`:

```properties
OCR_COMANDO=C:/Program Files/Tesseract-OCR/tesseract.exe
OCR_IDIOMAS=eng+fra+deu+spa
```

Sem OCR, ou quando sua execução falha, a API retorna `extractionStatus=REVISAO_NECESSARIA` e uma mensagem explicando a necessidade de revisão. O arquivo permanece armazenado e pode receber texto manualmente. Nenhuma leitura incerta é apresentada como sucesso silencioso.

A regra de presença exige um dos termos; a de idioma exige dois termos distintos. A comparação ignora caixa e acentos e é uma heurística textual simples. Texto vazio produz `MANUAL_REVIEW`; condição atendida produz `PASSED`; falhas usam a severidade da regra. A vigência inclui as datas inicial e final. Sem regras aplicáveis, a lista de achados fica vazia, e a interface informa a necessidade de revisão.

## Testes e build

```powershell
.\mvnw.cmd verify
```

Os testes iniciam PostgreSQL real em uma porta temporária e validam o esquema SQL com as entidades JPA. Cobrem CRUD, erros, multipart, PDF, download, versões concorrentes, polimorfismo, vigência, histórico, exclusões e persistência após reiniciar a aplicação. Não dependem do banco local nem de Docker.

O JAR fica em `target/packrule-1.0.0-SNAPSHOT.jar` e usa o PostgreSQL configurado no ambiente:

```powershell
java -jar target/packrule-1.0.0-SNAPSHOT.jar
```

Para Linux/macOS, use Maven 3.9 ou superior e os mesmos objetivos (`mvn verify`, `mvn -Plocal spring-boot:test-run`). O wrapper fornecido atende ao Windows.

## Correspondência com a AEP

| Critério | Evidência |
| :--- | :--- |
| Aderência ao planejamento | R01–R09 implementados sobre produtos, versões, mercados, regras, análises e achados |
| Pilares de POO | Classe abstrata, duas subclasses, `@Override`, encapsulamento e composições 1:N |
| CRUD funcional | Produtos com POST, GET, PUT e DELETE, executados contra PostgreSQL nos testes |
| Persistência em BD | PostgreSQL real, SQL em `/database`, JPA com validação do esquema e histórico persistido |

O escopo acadêmico não prevê contas ou autenticação. A API e o banco de desenvolvimento ficam restritos a localhost por padrão.
