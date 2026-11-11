package br.com.packrule.dto;

import br.com.packrule.modelo.Achado;
import br.com.packrule.modelo.Classificacao;
import br.com.packrule.modelo.Severidade;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record AchadoResposta(
        UUID id,
        @JsonProperty("analysisId") UUID analiseId,
        @JsonProperty("ruleId") UUID regraId,
        @JsonProperty("marketId") UUID mercadoId,
        @JsonProperty("classification") Classificacao classificacao,
        @JsonProperty("severity") Severidade severidade,
        @JsonProperty("ruleTitle") String tituloRegra,
        @JsonProperty("explanation") String explicacao,
        @JsonProperty("evidence") String evidencia,
        @JsonProperty("source") String fonteLegal) {

    public static AchadoResposta de(Achado achado) {
        return new AchadoResposta(achado.getId(), achado.getAnalise().getId(), achado.getRegra().getId(),
                achado.getMercado().getId(), achado.getClassificacao(), achado.getSeveridade(), achado.getTitulo(),
                achado.getDescricao(), achado.getEvidencia(), achado.getFonteLegal());
    }
}
