package br.com.packrule.conformidade;

import br.com.packrule.modelo.Achado;
import br.com.packrule.modelo.AnaliseConformidade;
import br.com.packrule.modelo.Mercado;
import br.com.packrule.modelo.Regra;
import br.com.packrule.modelo.VersaoEmbalagem;
import br.com.packrule.repositorios.RegraRepositorio;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class MotorConformidade {

    private final RegraRepositorio regras;

    public MotorConformidade(RegraRepositorio regras) {
        this.regras = regras;
    }

    public AnaliseConformidade executar(VersaoEmbalagem versao, Set<Mercado> mercados, LocalDate dataReferencia) {
        AnaliseConformidade analise = new AnaliseConformidade(versao, mercados, dataReferencia);
        Set<UUID> identificadores = mercados.stream().map(Mercado::getId).collect(Collectors.toSet());
        List<Regra> aplicaveis = regras.buscarAplicaveis(identificadores, versao.getProduto().getCategoria(), dataReferencia);
        for (Regra regra : aplicaveis) {
            RegraRegulatoria avaliador = switch (regra.getTipo()) {
                case INFORMATION_PRESENCE -> new RegraPresencaInformacao(regra);
                case LANGUAGE -> new RegraIdioma(regra);
            };
            for (Mercado mercado : mercados) {
                if (avaliador.aplicaAo(versao.getProduto(), mercado.getId(), dataReferencia)) {
                    analise.adicionarAchado(new Achado(analise, regra, mercado, avaliador.avaliar(analise.getTextoAnalisado())));
                }
            }
        }
        return analise;
    }
}
