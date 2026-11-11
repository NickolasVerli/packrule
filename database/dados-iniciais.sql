INSERT INTO mercado (id, codigo, nome, regiao, idioma_referencia) VALUES
    ('00000000-0000-0000-0000-000000000001', 'FR', 'França', 'União Europeia', 'fr'),
    ('00000000-0000-0000-0000-000000000002', 'DE', 'Alemanha', 'União Europeia', 'de'),
    ('00000000-0000-0000-0000-000000000003', 'ES', 'Espanha', 'União Europeia', 'es')
ON CONFLICT (id) DO NOTHING;
