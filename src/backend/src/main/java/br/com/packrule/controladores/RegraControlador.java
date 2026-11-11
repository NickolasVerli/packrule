package br.com.packrule.controladores;

import br.com.packrule.dto.DadosRegra;
import br.com.packrule.dto.RegraResposta;
import br.com.packrule.servicos.RegraServico;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/regras")
public class RegraControlador {

    private final RegraServico regras;

    public RegraControlador(RegraServico regras) {
        this.regras = regras;
    }

    @GetMapping
    public List<RegraResposta> listar(@RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "100") @Min(1) @Max(200) int tamanho) {
        return regras.listar(pagina, tamanho);
    }

    @GetMapping("/{id}")
    public RegraResposta buscar(@PathVariable UUID id) {
        return regras.buscar(id);
    }

    @PostMapping
    public ResponseEntity<RegraResposta> criar(@Valid @RequestBody DadosRegra dados) {
        RegraResposta regra = regras.criar(dados);
        return ResponseEntity.created(URI.create("/api/regras/" + regra.id())).body(regra);
    }

    @PutMapping("/{id}")
    public RegraResposta atualizar(@PathVariable UUID id, @Valid @RequestBody DadosRegra dados) {
        return regras.atualizar(id, dados);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        regras.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
