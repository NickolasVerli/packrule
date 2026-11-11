# PackRule · Frontend

Interface React 19 com Vite, conectada ao backend Java por API REST. Produtos, arquivos, regras e análises são armazenados no PostgreSQL pelo servidor.

## Executar

Requisitos: Node.js 22.12 ou superior e npm. Primeiro, inicie o backend conforme [seu README](../backend/README.md).

Dentro de `src/frontend`:

```powershell
npm ci
npm run dev
```

Acesse `http://localhost:5173`. O Vite encaminha `/api` para `http://127.0.0.1:8080`. Para outro endereço de API, copie `.env.example` para `.env` nesta pasta e configure `VITE_API_URL`. Origens diferentes precisam estar autorizadas em `FRONTEND_ORIGENS` no backend.

```powershell
npm test
npm run lint
npm run build
npm run preview
```

O preview também encaminha `/api` ao backend local. Na hospedagem do build, configure um proxy para `/api` ou defina `VITE_API_URL` antes de compilar.

## Organização

```text
src/
├── componentes/    elementos, layout e avisos
├── estilos/        estilos e tokens visuais
├── paginas/        telas de produtos, embalagens, regras e análises
├── servicos/       cliente HTTP, erros e paginação
├── dados.js        operações dos módulos da API
├── verificacao.js  filtros visuais de categoria e vigência
├── config.js       classificações, categorias e formatos
├── hooks.js        carregamento e título de página
└── utils.js        formatadores
```

`dadosIniciais.js` é usado apenas como fixture dos testes de interface. Não popula a aplicação. Os registros antigos do navegador não são apagados nem migrados automaticamente; a aplicação passa a consultar o PostgreSQL.

## Fluxo

1. Cadastre um produto com nome, categoria e descrição.
2. Cadastre as regras desejadas, com fonte, termos, mercados e vigência.
3. Envie uma versão de embalagem em PDF, PNG ou JPG.
4. Revise o texto extraído; o arquivo original pode ser baixado na tela da versão.
5. Selecione embalagem, mercados e data para executar a análise.
6. Consulte resultados e histórico. O título e a fonte originais de cada achado são preservados.

A decisão de conformidade é executada no servidor. Os filtros no cliente servem à apresentação e à estimativa de regras na tela. Falhas da API são exibidas ao usuário; não há retorno silencioso a dados locais.

## Telas

| Rota | Tela | Requisito |
| :--- | :--- | :--- |
| `/` | Painel | R08, R09 |
| `/products` | Produtos | R01 |
| `/products/new`, `/products/:id/edit` | Cadastro e edição | R01 |
| `/products/:id` | Produto, versões e análises | R02, R09 |
| `/products/:id/versions/new` | Upload de embalagem | R02, R03 |
| `/versions/:id` | Download e revisão do texto | R03, R04 |
| `/rules`, `/rules/new`, `/rules/:id/edit` | CRUD de regras | R06 |
| `/analyses/new` | Nova análise | R05, R07 |
| `/analyses/:id` | Resultados | R08 |
| `/analyses` | Histórico | R09 |

PDFs com texto são extraídos automaticamente. Imagens dependem de Tesseract configurado no backend; PDFs digitalizados sem texto exigem revisão manual. A tela informa quando não há texto suficiente para análise.
