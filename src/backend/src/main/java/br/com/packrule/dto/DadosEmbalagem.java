package br.com.packrule.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

public record DadosEmbalagem(
        @Size(max = 200) String material,
        @Size(max = 100) String quantidadeDeclarada,
        @Size(max = 50000) String textoExtraido,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataLancamento) {
}
