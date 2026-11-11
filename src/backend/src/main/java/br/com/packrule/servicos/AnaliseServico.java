package br.com.packrule.servicos;

import br.com.packrule.conformidade.MotorConformidade;
import br.com.packrule.dto.AnaliseResposta;
import br.com.packrule.dto.DadosAnalise;
import br.com.packrule.excecoes.RecursoNaoEncontradoException;
import br.com.packrule.modelo.AnaliseConformidade;
import br.com.packrule.repositorios.AnaliseRepositorio;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AnaliseServico {

    private final AnaliseRepositorio analises;
    private final EmbalagemServico embalagens;
    private final MercadoServico mercados;
    private final MotorConformidade motor;

    public AnaliseServico(AnaliseRepositorio analises, EmbalagemServico embalagens, MercadoServico mercados,
            MotorConformidade motor) {
        this.analises = analises;
        this.embalagens = embalagens;
        this.mercados = mercados;
        this.motor = motor;
    }

    public List<AnaliseResposta> listar(UUID produtoId, UUID versaoId, int pagina, int tamanho) {
        PageRequest paginacao = PageRequest.of(pagina, tamanho, Sort.by(Sort.Direction.DESC, "dataExecucao", "id"));
        if (versaoId != null) {
            return analises.findByVersaoEmbalagemId(versaoId, paginacao).map(AnaliseResposta::de).getContent();
        }
        if (produtoId != null) {
            return analises.findByVersaoEmbalagemProdutoId(produtoId, paginacao).map(AnaliseResposta::de).getContent();
        }
        return analises.findAll(paginacao).map(AnaliseResposta::de).getContent();
    }

    public AnaliseResposta buscar(UUID id) {
        return AnaliseResposta.de(obter(id));
    }

    @Transactional
    public AnaliseResposta executar(DadosAnalise dados) {
        AnaliseConformidade analise = motor.executar(embalagens.obter(dados.versaoId()),
                mercados.obterTodos(dados.mercadosIds()), dados.dataReferencia());
        return AnaliseResposta.de(analises.save(analise));
    }

    @Transactional
    public void excluir(UUID id) {
        analises.delete(obter(id));
    }

    private AnaliseConformidade obter(UUID id) {
        return analises.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Análise não encontrada."));
    }
}
