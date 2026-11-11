package br.com.packrule.conformidade;

import br.com.packrule.modelo.Regra;

public class RegraPresencaInformacao extends RegraRegulatoria {

    public RegraPresencaInformacao(Regra regra) {
        super(regra);
    }

    @Override
    public ResultadoRegra avaliar(String texto) {
        return avaliarTermos(texto, 1, "Nenhum dos termos exigidos foi encontrado no texto da embalagem.");
    }
}
