package br.com.packrule.dto;

import br.com.packrule.modelo.Produto;
import br.com.packrule.modelo.StatusProduto;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record ProdutoResposta(
        UUID id,
        @JsonProperty("name") String nome,
        @JsonProperty("category") String categoria,
        @JsonProperty("description") String descricao,
        String sku,
        StatusProduto status) {

    public static ProdutoResposta de(Produto produto) {
        return new ProdutoResposta(produto.getId(), produto.getNome(), produto.getCategoria(),
                produto.getDescricao(), produto.getSku(), produto.getStatus());
    }
}
