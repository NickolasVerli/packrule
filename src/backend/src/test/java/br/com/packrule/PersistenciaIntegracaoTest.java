package br.com.packrule;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.packrule.dto.DadosProduto;
import br.com.packrule.dto.ProdutoResposta;
import br.com.packrule.servicos.ProdutoServico;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.context.ConfigurableApplicationContext;

class PersistenciaIntegracaoTest extends BancoIntegracao {

    @Test
    void conservaProdutoDepoisDeReiniciarAAplicacao() {
        UUID produtoId;
        try (ConfigurableApplicationContext primeira = iniciarAplicacao()) {
            ProdutoResposta produto = primeira.getBean(ProdutoServico.class)
                    .criar(new DadosProduto("Produto persistente", "Outros", "Reinício da aplicação", null, null));
            produtoId = produto.id();
        }
        try (ConfigurableApplicationContext segunda = iniciarAplicacao()) {
            ProdutoServico produtos = segunda.getBean(ProdutoServico.class);
            assertThat(produtos.buscar(produtoId).nome()).isEqualTo("Produto persistente");
            produtos.excluir(produtoId);
        }
    }

    private ConfigurableApplicationContext iniciarAplicacao() {
        SpringApplication aplicacao = new SpringApplication(AplicacaoPackrule.class);
        aplicacao.setWebApplicationType(WebApplicationType.NONE);
        return aplicacao.run("--spring.datasource.url=" + banco.getJdbcUrl("postgres", "postgres"),
                "--spring.datasource.username=postgres", "--spring.datasource.password=", "--spring.main.banner-mode=off");
    }
}
