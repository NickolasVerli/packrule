package br.com.packrule.servicos;

import br.com.packrule.dto.DadosEmbalagem;
import br.com.packrule.dto.EmbalagemResposta;
import br.com.packrule.excecoes.RecursoNaoEncontradoException;
import br.com.packrule.modelo.ArquivoEmbalagem;
import br.com.packrule.modelo.Produto;
import br.com.packrule.modelo.VersaoEmbalagem;
import br.com.packrule.repositorios.ArquivoRepositorio;
import br.com.packrule.repositorios.EmbalagemRepositorio;
import br.com.packrule.repositorios.ProdutoRepositorio;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class EmbalagemServico {

    private final ProdutoRepositorio produtos;
    private final EmbalagemRepositorio embalagens;
    private final ArquivoRepositorio arquivos;
    private final LeituraEmbalagemServico leitura;

    public EmbalagemServico(ProdutoRepositorio produtos, EmbalagemRepositorio embalagens,
            ArquivoRepositorio arquivos, LeituraEmbalagemServico leitura) {
        this.produtos = produtos;
        this.embalagens = embalagens;
        this.arquivos = arquivos;
        this.leitura = leitura;
    }

    public List<EmbalagemResposta> listar(UUID produtoId, int pagina, int tamanho) {
        PageRequest paginacao = PageRequest.of(pagina, tamanho, Sort.by(Sort.Direction.DESC, "numeroVersao", "id"));
        if (produtoId != null) {
            if (!produtos.existsById(produtoId)) {
                throw new RecursoNaoEncontradoException("Produto não encontrado.");
            }
            return embalagens.findByProdutoId(produtoId, paginacao).map(EmbalagemResposta::de).getContent();
        }
        return embalagens.findAll(paginacao).map(EmbalagemResposta::de).getContent();
    }

    public EmbalagemResposta buscar(UUID id) {
        return EmbalagemResposta.de(obter(id));
    }

    @Transactional
    public EmbalagemResposta criar(UUID produtoId, MultipartFile arquivo, DadosEmbalagem dados) {
        if (!produtos.existsById(produtoId)) {
            throw new RecursoNaoEncontradoException("Produto não encontrado.");
        }
        ArquivoValidado validado = leitura.validar(arquivo);
        ExtracaoTexto extracao = leitura.extrair(validado, dados.textoExtraido());
        Produto produto = produtos.buscarParaAtualizacao(produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado."));
        VersaoEmbalagem versao = embalagens.save(new VersaoEmbalagem(produto, produto.reservarNumeroVersao(), validado, dados, extracao));
        arquivos.save(new ArquivoEmbalagem(versao, validado.conteudo()));
        return EmbalagemResposta.de(versao);
    }

    @Transactional
    public EmbalagemResposta atualizarTexto(UUID id, String texto) {
        VersaoEmbalagem versao = obter(id);
        versao.atualizarTextoExtraido(texto);
        return EmbalagemResposta.de(versao);
    }

    public byte[] obterArquivo(UUID id) {
        return arquivos.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Arquivo da embalagem não encontrado."))
                .getConteudo();
    }

    @Transactional
    public void excluir(UUID id) {
        embalagens.delete(obter(id));
    }

    public VersaoEmbalagem obter(UUID id) {
        return embalagens.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Versão da embalagem não encontrada."));
    }
}
