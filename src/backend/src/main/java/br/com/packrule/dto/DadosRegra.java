package br.com.packrule.dto;

import br.com.packrule.modelo.Severidade;
import br.com.packrule.modelo.TipoRegra;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record DadosRegra(
        @JsonProperty("code") @Size(max = 80) String codigo,
        @JsonProperty("title") @NotBlank(message = "Informe o título da regra.") @Size(max = 160) String titulo,
        @JsonProperty("description") @NotBlank(message = "Informe a descrição da regra.") @Size(max = 4000) String descricao,
        @JsonProperty("type") @NotNull(message = "Selecione o tipo da regra.") TipoRegra tipo,
        @JsonProperty("terms") @NotEmpty(message = "Informe ao menos um termo de verificação.") @Size(max = 100)
        List<@NotBlank @Size(max = 200) String> termos,
        @JsonProperty("marketIds") @NotEmpty(message = "Selecione ao menos um mercado.") @Size(max = 20)
        Set<@NotNull UUID> mercadosIds,
        @JsonProperty("category") @NotBlank(message = "Informe a categoria ou ALL.") @Size(max = 80) String categoria,
        @JsonProperty("severity") @NotNull(message = "Selecione a severidade da regra.") Severidade severidade,
        @JsonProperty("startDate") @NotNull(message = "Informe o início da vigência.") LocalDate inicioVigencia,
        @JsonProperty("endDate") LocalDate fimVigencia,
        @JsonProperty("source") @NotBlank(message = "Informe a fonte da regra.") @Size(max = 2000) String fonteLegal,
        @JsonProperty("active") Boolean ativa,
        @JsonProperty("expectedLanguage") @Size(max = 10) String idiomaEsperado) {
}
