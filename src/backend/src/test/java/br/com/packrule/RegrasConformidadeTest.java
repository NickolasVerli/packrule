package br.com.packrule;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.packrule.conformidade.RegraIdioma;
import br.com.packrule.conformidade.RegraPresencaInformacao;
import br.com.packrule.conformidade.RegraRegulatoria;
import br.com.packrule.dto.DadosRegra;
import br.com.packrule.modelo.Classificacao;
import br.com.packrule.modelo.Regra;
import br.com.packrule.modelo.Severidade;
import br.com.packrule.modelo.TipoRegra;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class RegrasConformidadeTest {

    @Test
    void usaComportamentosDiferentesPelaMesmaClasseAbstrata() {
        Regra dados = criarRegra(Severidade.CRITICAL);
        RegraRegulatoria presenca = new RegraPresencaInformacao(dados);
        RegraRegulatoria idioma = new RegraIdioma(dados);
        assertThat(presenca.avaliar("Fabrique").classificacao()).isEqualTo(Classificacao.PASSED);
        assertThat(idioma.avaliar("Fabrique").classificacao()).isEqualTo(Classificacao.CRITICAL);
    }

    @Test
    void reconheceIdiomaComDoisTermosIgnorandoMaiusculasEAcentos() {
        RegraRegulatoria regra = new RegraIdioma(criarRegra(Severidade.CRITICAL));
        assertThat(regra.avaliar("FABRIQUE. Contenu 100 ml.").classificacao()).isEqualTo(Classificacao.PASSED);
        assertThat(regra.avaliar("FABRIQUE. Contenu 100 ml.").evidencia()).contains("Fabriqué", "contenu");
    }

    @Test
    void usaSeveridadeDaRegraQuandoOTextoNaoAtendeACondicao() {
        RegraRegulatoria regra = new RegraPresencaInformacao(criarRegra(Severidade.WARNING));
        assertThat(regra.avaliar("Sabão 100 g").classificacao()).isEqualTo(Classificacao.WARNING);
    }

    @Test
    void exigeRevisaoManualQuandoNaoHaTexto() {
        Regra dados = criarRegra(Severidade.CRITICAL);
        for (RegraRegulatoria regra : List.of(new RegraPresencaInformacao(dados), new RegraIdioma(dados))) {
            assertThat(regra.avaliar(" ").classificacao()).isEqualTo(Classificacao.MANUAL_REVIEW);
            assertThat(regra.avaliar(null).classificacao()).isEqualTo(Classificacao.MANUAL_REVIEW);
        }
    }

    private Regra criarRegra(Severidade severidade) {
        List<String> termos = List.of("Fabriqué", "contenu");
        DadosRegra dados = new DadosRegra(null, "Verificação", "Exemplo acadêmico", TipoRegra.LANGUAGE,
                termos, Set.of(UUID.randomUUID()), "ALL", severidade, LocalDate.of(2024, 1, 1), null,
                "Planejamento acadêmico", true, "fr");
        return new Regra(dados, Set.of(), termos);
    }
}
