package br.com.packrule.dto;

import br.com.packrule.modelo.StatusProduto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DadosProduto(
        @JsonProperty("name") @NotBlank(message = "Informe o nome do produto.")
        @Size(max = 160, message = "O nome deve ter até 160 caracteres.") String nome,
        @JsonProperty("category") @NotBlank(message = "Informe a categoria do produto.")
        @Size(max = 80, message = "A categoria deve ter até 80 caracteres.") String categoria,
        @JsonProperty("description") @Size(max = 4000, message = "A descrição deve ter até 4000 caracteres.")
        String descricao,
        @Size(max = 80, message = "O SKU deve ter até 80 caracteres.") String sku,
        StatusProduto status) {
}
