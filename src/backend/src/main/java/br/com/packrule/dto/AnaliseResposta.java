package br.com.packrule.dto;

import br.com.packrule.modelo.AnaliseConformidade;
import br.com.packrule.modelo.StatusAnalise;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record AnaliseResposta(
        UUID id,
        @JsonProperty("productId") UUID produtoId,
        @JsonProperty("versionId") UUID versaoId,
        @JsonProperty("marketIds") List<UUID> mercadosIds,
        @JsonProperty("referenceDate") LocalDate dataReferencia,
        @JsonProperty("createdAt") Instant dataExecucao,
        StatusAnalise status,
        @JsonProperty("productName") String nomeProduto,
        @JsonProperty("productCategory") String categoriaProduto,
        @JsonProperty("analyzedText") String textoAnalisado,
        @JsonProperty("findings") List<AchadoResposta> achados) {

    public static AnaliseResposta de(AnaliseConformidade analise) {
        return new AnaliseResposta(analise.getId(), analise.getVersaoEmbalagem().getProduto().getId(),
                analise.getVersaoEmbalagem().getId(), analise.getMercados().stream().map(mercado -> mercado.getId()).sorted().toList(),
                analise.getDataReferencia(), analise.getDataExecucao(), analise.getStatus(), analise.getNomeProduto(),
                analise.getCategoriaProduto(), analise.getTextoAnalisado(), analise.getAchados().stream()
                        .map(AchadoResposta::de).sorted(Comparator.comparing(AchadoResposta::classificacao)
                                .thenComparing(AchadoResposta::mercadoId).thenComparing(AchadoResposta::tituloRegra)).toList());
    }
}
