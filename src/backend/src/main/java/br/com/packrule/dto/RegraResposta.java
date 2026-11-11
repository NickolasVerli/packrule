package br.com.packrule.dto;

import br.com.packrule.modelo.Regra;
import br.com.packrule.modelo.Severidade;
import br.com.packrule.modelo.TipoRegra;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record RegraResposta(
        UUID id,
        @JsonProperty("code") String codigo,
        @JsonProperty("title") String titulo,
        @JsonProperty("description") String descricao,
        @JsonProperty("type") TipoRegra tipo,
        @JsonProperty("terms") List<String> termos,
        @JsonProperty("marketIds") List<UUID> mercadosIds,
        @JsonProperty("category") String categoria,
        @JsonProperty("severity") Severidade severidade,
        @JsonProperty("startDate") LocalDate inicioVigencia,
        @JsonProperty("endDate") LocalDate fimVigencia,
        @JsonProperty("source") String fonteLegal,
        @JsonProperty("active") boolean ativa,
        @JsonProperty("expectedLanguage") String idiomaEsperado) {

    public static RegraResposta de(Regra regra) {
        return new RegraResposta(regra.getId(), regra.getCodigo(), regra.getTitulo(), regra.getDescricao(),
                regra.getTipo(), regra.getTermos(), regra.getMercados().stream().map(mercado -> mercado.getId()).sorted().toList(),
                regra.getCategoria(), regra.getSeveridade(), regra.getInicioVigencia(), regra.getFimVigencia(),
                regra.getFonteLegal(), regra.isAtiva(), regra.getIdiomaEsperado());
    }
}
