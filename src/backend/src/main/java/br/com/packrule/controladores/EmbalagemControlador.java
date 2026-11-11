package br.com.packrule.controladores;

import br.com.packrule.dto.DadosEmbalagem;
import br.com.packrule.dto.DadosTexto;
import br.com.packrule.dto.EmbalagemResposta;
import br.com.packrule.servicos.EmbalagemServico;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class EmbalagemControlador {

    private final EmbalagemServico embalagens;

    public EmbalagemControlador(EmbalagemServico embalagens) {
        this.embalagens = embalagens;
    }

    @GetMapping("/embalagens")
    public List<EmbalagemResposta> listar(@RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "100") @Min(1) @Max(200) int tamanho) {
        return embalagens.listar(null, pagina, tamanho);
    }

    @GetMapping("/produtos/{produtoId}/embalagens")
    public List<EmbalagemResposta> listarPorProduto(@PathVariable UUID produtoId,
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "100") @Min(1) @Max(200) int tamanho) {
        return embalagens.listar(produtoId, pagina, tamanho);
    }

    @GetMapping("/embalagens/{id}")
    public EmbalagemResposta buscar(@PathVariable UUID id) {
        return embalagens.buscar(id);
    }

    @PostMapping(value = "/produtos/{produtoId}/embalagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EmbalagemResposta> criar(@PathVariable UUID produtoId,
            @RequestPart("arquivo") MultipartFile arquivo, @Valid @ModelAttribute DadosEmbalagem dados) {
        EmbalagemResposta versao = embalagens.criar(produtoId, arquivo, dados);
        return ResponseEntity.created(URI.create("/api/embalagens/" + versao.id())).body(versao);
    }

    @PatchMapping("/embalagens/{id}/texto")
    public EmbalagemResposta atualizarTexto(@PathVariable UUID id, @Valid @RequestBody DadosTexto dados) {
        return embalagens.atualizarTexto(id, dados.textoExtraido());
    }

    @GetMapping("/embalagens/{id}/arquivo")
    public ResponseEntity<byte[]> baixarArquivo(@PathVariable UUID id) {
        EmbalagemResposta versao = embalagens.buscar(id);
        byte[] conteudo = embalagens.obterArquivo(id);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(versao.tipoArquivo()))
                .contentLength(conteudo.length).cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(versao.nomeArquivo(), StandardCharsets.UTF_8).build().toString())
                .body(conteudo);
    }

    @DeleteMapping("/embalagens/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        embalagens.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
