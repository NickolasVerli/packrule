package br.com.packrule.dto;

import br.com.packrule.modelo.StatusExtracao;
import br.com.packrule.modelo.VersaoEmbalagem;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmbalagemResposta(
        UUID id,
        @JsonProperty("productId") UUID produtoId,
        @JsonProperty("number") int numeroVersao,
        @JsonProperty("fileName") String nomeArquivo,
        @JsonProperty("fileType") String tipoArquivo,
        @JsonProperty("fileSize") long tamanhoArquivo,
        String material,
        @JsonProperty("declaredQuantity") String quantidadeDeclarada,
        @JsonProperty("extractedText") String textoExtraido,
        @JsonProperty("uploadedAt") Instant dataEnvio,
        @JsonProperty("launchDate") LocalDate dataLancamento,
        @JsonProperty("extractionStatus") StatusExtracao statusExtracao,
        @JsonProperty("extractionMessage") String mensagemExtracao) {

    public static EmbalagemResposta de(VersaoEmbalagem versao) {
        return new EmbalagemResposta(versao.getId(), versao.getProduto().getId(), versao.getNumeroVersao(),
                versao.getNomeArquivo(), versao.getTipoArquivo(), versao.getTamanhoArquivo(), versao.getMaterial(),
                versao.getQuantidadeDeclarada(), versao.getTextoExtraido(), versao.getDataEnvio(), versao.getDataLancamento(),
                versao.getStatusExtracao(), versao.getMensagemExtracao());
    }
}
