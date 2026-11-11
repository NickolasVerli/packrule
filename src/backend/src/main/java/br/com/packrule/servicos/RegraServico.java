package br.com.packrule.servicos;

import br.com.packrule.conformidade.RegraRegulatoria;
import br.com.packrule.dto.DadosRegra;
import br.com.packrule.dto.RegraResposta;
import br.com.packrule.excecoes.DadosInvalidosException;
import br.com.packrule.excecoes.RecursoNaoEncontradoException;
import br.com.packrule.modelo.Regra;
import br.com.packrule.modelo.TipoRegra;
import br.com.packrule.repositorios.RegraRepositorio;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RegraServico {

    private final RegraRepositorio regras;
    private final MercadoServico mercados;

    public RegraServico(RegraRepositorio regras, MercadoServico mercados) {
        this.regras = regras;
        this.mercados = mercados;
    }

    public List<RegraResposta> listar(int pagina, int tamanho) {
        return regras.findByExcluidaFalse(PageRequest.of(pagina, tamanho, Sort.by("titulo", "id")))
                .map(RegraResposta::de).getContent();
    }

    public RegraResposta buscar(UUID id) {
        return RegraResposta.de(obter(id));
    }

    @Transactional
    public RegraResposta criar(DadosRegra dados) {
        List<String> termos = validar(dados);
        Regra regra = new Regra(dados, mercados.obterTodos(dados.mercadosIds()), termos);
        return RegraResposta.de(regras.save(regra));
    }

    @Transactional
    public RegraResposta atualizar(UUID id, DadosRegra dados) {
        Regra regra = obter(id);
        List<String> termos = validar(dados);
        regra.atualizar(dados, mercados.obterTodos(dados.mercadosIds()), termos);
        return RegraResposta.de(regra);
    }

    @Transactional
    public void excluir(UUID id) {
        obter(id).excluir();
    }

    private Regra obter(UUID id) {
        return regras.findByIdAndExcluidaFalse(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Regra não encontrada."));
    }

    private List<String> validar(DadosRegra dados) {
        if (dados.fimVigencia() != null && dados.fimVigencia().isBefore(dados.inicioVigencia())) {
            throw new DadosInvalidosException("A data final não pode ser anterior ao início da vigência.");
        }
        Map<String, String> distintos = new LinkedHashMap<>();
        dados.termos().forEach(termo -> distintos.putIfAbsent(RegraRegulatoria.normalizar(termo), termo.strip()));
        if (dados.tipo() == TipoRegra.LANGUAGE && distintos.size() < 2) {
            throw new DadosInvalidosException("Informe ao menos dois termos distintos para verificar o idioma.");
        }
        return new ArrayList<>(distintos.values());
    }
}
