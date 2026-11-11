package br.com.packrule.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

public record DadosAnalise(
        @JsonProperty("versionId") @NotNull(message = "Selecione uma versão de embalagem.") UUID versaoId,
        @JsonProperty("marketIds") @NotEmpty(message = "Selecione ao menos um mercado.") @Size(max = 20)
        Set<@NotNull UUID> mercadosIds,
        @JsonProperty("referenceDate") @NotNull(message = "Informe a data de referência.") LocalDate dataReferencia) {
}
