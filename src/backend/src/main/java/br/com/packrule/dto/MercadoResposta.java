package br.com.packrule.dto;

import br.com.packrule.modelo.Mercado;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record MercadoResposta(
        UUID id,
        @JsonProperty("code") String codigo,
        @JsonProperty("name") String nome,
        @JsonProperty("region") String regiao,
        @JsonProperty("referenceLanguage") String idiomaReferencia) {

    public static MercadoResposta de(Mercado mercado) {
        return new MercadoResposta(mercado.getId(), mercado.getCodigo(), mercado.getNome(),
                mercado.getRegiao(), mercado.getIdiomaReferencia());
    }
}
