CREATE TABLE IF NOT EXISTS produto (
    id UUID PRIMARY KEY,
    sku VARCHAR(80) UNIQUE,
    nome VARCHAR(160) NOT NULL CHECK (btrim(nome) <> ''),
    categoria VARCHAR(80) NOT NULL CHECK (btrim(categoria) <> ''),
    descricao VARCHAR(4000) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO')),
    proxima_versao INTEGER NOT NULL DEFAULT 1 CHECK (proxima_versao > 0)
);

CREATE TABLE IF NOT EXISTS mercado (
    id UUID PRIMARY KEY,
    codigo VARCHAR(3) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    regiao VARCHAR(100) NOT NULL,
    idioma_referencia VARCHAR(10) NOT NULL
);
