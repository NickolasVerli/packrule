package br.com.packrule.servicos;

import br.com.packrule.dto.DadosProduto;
import br.com.packrule.dto.ProdutoResposta;
import br.com.packrule.excecoes.RecursoNaoEncontradoException;
import br.com.packrule.modelo.Produto;
import br.com.packrule.repositorios.ProdutoRepositorio;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProdutoServico {

    private final ProdutoRepositorio produtos;

    public ProdutoServico(ProdutoRepositorio produtos) {
        this.produtos = produtos;
    }

    public List<ProdutoResposta> listar(int pagina, int tamanho) {
        return produtos.findAll(PageRequest.of(pagina, tamanho, Sort.by("nome", "id")))
                .map(ProdutoResposta::de).getContent();
    }

    public ProdutoResposta buscar(UUID id) {
        return ProdutoResposta.de(obter(id));
    }

    @Transactional
    public ProdutoResposta criar(DadosProduto dados) {
        Produto produto = new Produto(dados.nome(), dados.categoria(), dados.descricao(), dados.sku(), dados.status());
        return ProdutoResposta.de(produtos.save(produto));
    }

    @Transactional
    public ProdutoResposta atualizar(UUID id, DadosProduto dados) {
        Produto produto = obter(id);
        produto.atualizar(dados.nome(), dados.categoria(), dados.descricao(), dados.sku(), dados.status());
        return ProdutoResposta.de(produto);
    }

    @Transactional
    public void excluir(UUID id) {
        produtos.delete(obter(id));
    }

    public Produto obter(UUID id) {
        return produtos.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado."));
    }
}
