# PackRule - Código-fonte

Cadastro de produtos e embalagens, análise por mercado e consulta do histórico de resultados.

## Executar no Windows

Requisitos: JDK 21 ou 25 e Node.js 22.12 ou superior, com npm.

Abra dois terminais na pasta `src`. No primeiro:

```powershell
.\backend\mvnw.cmd -Plocal spring-boot:test-run
```

No segundo:

```powershell
cd frontend
npm ci
npm run dev
```

Acesse http://localhost:5173. Use `Ctrl+C` em cada terminal para encerrar.

Outras opções de execução estão nos READMEs do [backend](backend/README.md) e do [frontend](frontend/README.md).
