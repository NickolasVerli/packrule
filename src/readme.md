O código está dividido em `backend` e `frontend`.

- `backend`: API Java com Spring Boot, regras de negócio, persistência PostgreSQL e testes de integração.
- `frontend`: interface React com Vite, conectada ao backend por HTTP.

As instruções de execução estão no README de cada pasta. O SQL de criação das tabelas está em `/database/schema.sql` e é incluído no backend durante o build.
