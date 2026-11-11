# PackRule · Frontend

Interface web do PackRule, feita com **React 19** e **Vite**.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Como executar

```bash
cd src/frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

Outros comandos:

| Comando           | Função                          |
| :---------------- | :------------------------------ |
| `npm run build`   | Gera a versão de produção       |
| `npm run preview` | Serve a versão de produção      |
| `npm run lint`    | Executa o oxlint                |

## Organização

```
src/
├── components/   componentes reutilizáveis (layout, formulários, badges)
├── context/      contexto de avisos (toasts)
├── hooks/        useAsync e useDocumentTitle
├── pages/        telas, agrupadas por módulo
│   ├── products/ produtos e versões de embalagem
│   ├── rules/    regras de conformidade
│   └── analyses/ nova análise, resultado e histórico
├── services/     camada de acesso a dados e motor de verificação
├── styles/       tokens, layout, componentes e páginas
└── utils/        constantes e formatadores
```

## Dados e integração com o backend

O backend (Java, Spring Boot e PostgreSQL) ainda não existe nesta etapa. Por isso a camada
`src/services` expõe uma API assíncrona por módulo (`productService`, `packagingService`,
`ruleService`, `marketService` e `analysisService`) e persiste os dados no `localStorage` do
navegador, com dados iniciais em `services/seed.js`.

Quando a API REST estiver pronta, apenas os arquivos de `src/services` precisam ser trocados por
chamadas HTTP. As páginas continuam as mesmas.

`complianceEngine.js` reproduz no cliente a seleção de regras por mercado, categoria e vigência
descrita na documentação, para que o fluxo completo possa ser demonstrado. No sistema final, essa
decisão pertence ao Compliance Engine do backend.

## Telas

| Rota                              | Tela                               | Requisito |
| :-------------------------------- | :--------------------------------- | :-------- |
| `/`                               | Painel                             |           |
| `/products`                       | Lista de produtos                  | R01       |
| `/products/new`, `/products/:id/edit` | Cadastro e edição de produto   | R01       |
| `/products/:id`                   | Detalhe, versões e análises        | R02, R09  |
| `/products/:id/versions/new`      | Envio de embalagem                 | R02, R03  |
| `/versions/:id`                   | Revisão do texto extraído          | R04       |
| `/rules`, `/rules/new`, `/rules/:id/edit` | CRUD de regras             | R06       |
| `/analyses/new`                   | Nova análise                       | R05, R07  |
| `/analyses/:id`                   | Resultado da análise               | R08       |
| `/analyses`                       | Histórico de análises              | R09       |

## Limitações desta etapa

- O texto da embalagem é informado manualmente. O OCR (R04) será integrado ao backend.
- O arquivo enviado tem apenas os metadados registrados. O armazenamento do arquivo ficará a
  cargo do backend.
