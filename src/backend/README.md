# PackRule - Backend

API para o cadastro de produtos, embalagens e regras, execução de análises e consulta do histórico.

## Executar no Windows

Requisito: JDK 21 ou 25 no `PATH` ou em `JAVA_HOME`.

Na pasta `src/backend`:

```powershell
.\mvnw.cmd -Plocal spring-boot:test-run
```

A API fica disponível em http://127.0.0.1:8080/api. O banco local inicia junto com a aplicação e mantém os dados entre execuções. Use `Ctrl+C` para encerrar.

Para abrir o site, inicie também o [frontend](../frontend/README.md).

## PostgreSQL instalado ou Docker

Crie ou edite o `.env` na raiz do projeto usando [.env.example](../../.env.example) como referência. Configure `BANCO_URL`, `BANCO_USUARIO` e `BANCO_SENHA` com os dados da conexão.

Se usar Docker, inicie o banco a partir da raiz:

```powershell
docker compose up -d banco
```

Depois, na pasta `src/backend`, inicie a API:

```powershell
.\mvnw.cmd spring-boot:run
```

## Leitura de imagens

Para habilitar a extração de texto de PNG e JPG, execute na raiz do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/configurar-ocr.ps1
```

Reinicie o backend após a configuração.
