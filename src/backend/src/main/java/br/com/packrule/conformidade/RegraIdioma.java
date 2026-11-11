package br.com.packrule.conformidade;

import br.com.packrule.modelo.Regra;

public class RegraIdioma extends RegraRegulatoria {

    public RegraIdioma(Regra regra) {
        super(regra);
    }

    @Override
    public ResultadoRegra avaliar(String texto) {
        return avaliarTermos(texto, 2,
                "O texto da embalagem não contém ao menos dois termos do idioma exigido pelo mercado.");
    }
}
