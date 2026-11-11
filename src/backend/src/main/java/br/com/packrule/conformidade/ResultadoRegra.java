package br.com.packrule.conformidade;

import br.com.packrule.modelo.Classificacao;

public record ResultadoRegra(Classificacao classificacao, String explicacao, String evidencia) {
}
