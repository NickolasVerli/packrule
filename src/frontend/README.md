# PackRule - Frontend

Interface para cadastrar produtos e regras, enviar embalagens e consultar os resultados das análises.

## Executar no Windows

Requisitos: Node.js 22.12 ou superior, com npm, e [backend](../backend/README.md) em execução.

Na pasta `src/frontend`:

```powershell
npm ci
npm run dev
```

Acesse http://localhost:5173. Use `Ctrl+C` para encerrar.

## Build

Na mesma pasta:

```powershell
npm run build
npm run preview
```

A versão compilada fica em `dist`. O preview abre em http://localhost:4173 e também precisa do backend em execução.

Para usar outro endereço de API, configure `VITE_API_URL` no `.env` desta pasta, conforme [.env.example](.env.example), e reinicie o frontend.
