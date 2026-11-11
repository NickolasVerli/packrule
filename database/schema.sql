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

CREATE TABLE IF NOT EXISTS versao_embalagem (
    id UUID PRIMARY KEY,
    produto_id UUID NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
    numero_versao INTEGER NOT NULL CHECK (numero_versao > 0),
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(80) NOT NULL CHECK (tipo_arquivo IN ('application/pdf', 'image/png', 'image/jpeg')),
    tamanho_arquivo BIGINT NOT NULL CHECK (tamanho_arquivo > 0 AND tamanho_arquivo <= 10485760),
    material VARCHAR(200) NOT NULL DEFAULT '',
    quantidade_declarada VARCHAR(100) NOT NULL DEFAULT '',
    texto_extraido TEXT NOT NULL DEFAULT '',
    data_lancamento DATE,
    data_envio TIMESTAMP WITH TIME ZONE NOT NULL,
    status_extracao VARCHAR(30) NOT NULL CHECK (status_extracao IN ('EXTRAIDO', 'REVISADO', 'REVISAO_NECESSARIA')),
    mensagem_extracao VARCHAR(500) NOT NULL,
    UNIQUE (produto_id, numero_versao)
);

CREATE TABLE IF NOT EXISTS arquivo_embalagem (
    versao_embalagem_id UUID PRIMARY KEY REFERENCES versao_embalagem(id) ON DELETE CASCADE,
    conteudo BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS regra_regulatoria (
    id UUID PRIMARY KEY,
    codigo VARCHAR(80) NOT NULL UNIQUE,
    tipo_regra VARCHAR(30) NOT NULL CHECK (tipo_regra IN ('INFORMATION_PRESENCE', 'LANGUAGE')),
    titulo VARCHAR(160) NOT NULL CHECK (btrim(titulo) <> ''),
    descricao VARCHAR(4000) NOT NULL,
    fonte_legal VARCHAR(2000) NOT NULL CHECK (btrim(fonte_legal) <> ''),
    categoria VARCHAR(80) NOT NULL,
    inicio_vigencia DATE NOT NULL,
    fim_vigencia DATE,
    severidade_padrao VARCHAR(20) NOT NULL CHECK (severidade_padrao IN ('CRITICAL', 'WARNING')),
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    excluida BOOLEAN NOT NULL DEFAULT FALSE,
    campo_alvo VARCHAR(80) NOT NULL DEFAULT 'textoExtraido',
    idioma_esperado VARCHAR(10) NOT NULL DEFAULT '',
    CHECK (fim_vigencia IS NULL OR fim_vigencia >= inicio_vigencia)
);

CREATE TABLE IF NOT EXISTS regra_termo (
    regra_id UUID NOT NULL REFERENCES regra_regulatoria(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL,
    termo VARCHAR(200) NOT NULL CHECK (btrim(termo) <> ''),
    PRIMARY KEY (regra_id, ordem)
);

CREATE TABLE IF NOT EXISTS regra_mercado (
    regra_id UUID NOT NULL REFERENCES regra_regulatoria(id) ON DELETE CASCADE,
    mercado_id UUID NOT NULL REFERENCES mercado(id),
    PRIMARY KEY (regra_id, mercado_id)
);

CREATE TABLE IF NOT EXISTS analise_conformidade (
    id UUID PRIMARY KEY,
    versao_embalagem_id UUID NOT NULL REFERENCES versao_embalagem(id) ON DELETE CASCADE,
    data_execucao TIMESTAMP WITH TIME ZONE NOT NULL,
    data_referencia DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status = 'CONCLUIDA'),
    texto_analisado TEXT NOT NULL,
    nome_produto VARCHAR(160) NOT NULL,
    categoria_produto VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS analise_mercado (
    analise_id UUID NOT NULL REFERENCES analise_conformidade(id) ON DELETE CASCADE,
    mercado_id UUID NOT NULL REFERENCES mercado(id),
    PRIMARY KEY (analise_id, mercado_id)
);

CREATE TABLE IF NOT EXISTS achado (
    id UUID PRIMARY KEY,
    analise_id UUID NOT NULL REFERENCES analise_conformidade(id) ON DELETE CASCADE,
    regra_id UUID NOT NULL REFERENCES regra_regulatoria(id),
    mercado_id UUID NOT NULL REFERENCES mercado(id),
    severidade VARCHAR(20) NOT NULL CHECK (severidade IN ('CRITICAL', 'WARNING')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('CRITICAL', 'WARNING', 'PASSED', 'MANUAL_REVIEW')),
    titulo VARCHAR(160) NOT NULL,
    descricao TEXT NOT NULL,
    evidencia TEXT NOT NULL,
    fonte_legal VARCHAR(2000) NOT NULL,
    UNIQUE (analise_id, regra_id, mercado_id)
);

CREATE INDEX IF NOT EXISTS idx_analise_versao ON analise_conformidade (versao_embalagem_id, data_execucao DESC);
CREATE INDEX IF NOT EXISTS idx_achado_analise ON achado (analise_id);
CREATE INDEX IF NOT EXISTS idx_regra_aplicacao ON regra_regulatoria (ativa, excluida, categoria, inicio_vigencia, fim_vigencia);
CREATE INDEX IF NOT EXISTS idx_regra_mercado ON regra_mercado (mercado_id);
