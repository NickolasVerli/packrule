package br.com.packrule.controladores;

import br.com.packrule.dto.DadosProduto;
import br.com.packrule.dto.ProdutoResposta;
import br.com.packrule.servicos.ProdutoServico;
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
@RequestMapping("/api/produtos")
public class ProdutoControlador {

    private final ProdutoServico produtos;

    public ProdutoControlador(ProdutoServico produtos) {
        this.produtos = produtos;
    }

    @GetMapping
    public List<ProdutoResposta> listar(
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "100") @Min(1) @Max(200) int tamanho) {
        return produtos.listar(pagina, tamanho);
    }

    @GetMapping("/{id}")
    public ProdutoResposta buscar(@PathVariable UUID id) {
        return produtos.buscar(id);
    }

    @PostMapping
    public ResponseEntity<ProdutoResposta> criar(@Valid @RequestBody DadosProduto dados) {
        ProdutoResposta produto = produtos.criar(dados);
        return ResponseEntity.created(URI.create("/api/produtos/" + produto.id())).body(produto);
    }

    @PutMapping("/{id}")
    public ProdutoResposta atualizar(@PathVariable UUID id, @Valid @RequestBody DadosProduto dados) {
        return produtos.atualizar(id, dados);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        produtos.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
