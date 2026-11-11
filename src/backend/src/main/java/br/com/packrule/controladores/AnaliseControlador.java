package br.com.packrule.controladores;

import br.com.packrule.dto.AnaliseResposta;
import br.com.packrule.dto.DadosAnalise;
import br.com.packrule.servicos.AnaliseServico;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analises")
public class AnaliseControlador {

    private final AnaliseServico analises;

    public AnaliseControlador(AnaliseServico analises) {
        this.analises = analises;
    }

    @GetMapping
    public List<AnaliseResposta> listar(@RequestParam(required = false) UUID produtoId,
            @RequestParam(required = false) UUID versaoId,
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "100") @Min(1) @Max(200) int tamanho) {
        return analises.listar(produtoId, versaoId, pagina, tamanho);
    }

    @GetMapping("/{id}")
    public AnaliseResposta buscar(@PathVariable UUID id) {
        return analises.buscar(id);
    }

    @PostMapping
    public ResponseEntity<AnaliseResposta> executar(@Valid @RequestBody DadosAnalise dados) {
        AnaliseResposta analise = analises.executar(dados);
        return ResponseEntity.created(URI.create("/api/analises/" + analise.id())).body(analise);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        analises.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
