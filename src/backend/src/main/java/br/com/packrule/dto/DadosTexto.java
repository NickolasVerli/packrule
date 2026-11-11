package br.com.packrule.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DadosTexto(
        @JsonProperty("extractedText") @NotNull(message = "Informe o texto, mesmo que vazio.")
        @Size(max = 50000) String textoExtraido) {
}
