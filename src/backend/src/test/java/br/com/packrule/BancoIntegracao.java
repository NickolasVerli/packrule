package br.com.packrule;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.io.UncheckedIOException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public abstract class BancoIntegracao {

    protected static final EmbeddedPostgres banco = iniciarBanco();

    private static EmbeddedPostgres iniciarBanco() {
        try {
            EmbeddedPostgres instancia = EmbeddedPostgres.builder()
                    .setLocaleConfig("locale", "C")
                    .setLocaleConfig("encoding", "UTF-8")
                    .start();
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                try {
                    instancia.close();
                } catch (IOException erro) {
                    throw new UncheckedIOException(erro);
                }
            }));
            return instancia;
        } catch (IOException erro) {
            throw new UncheckedIOException(erro);
        }
    }

    @DynamicPropertySource
    static void configurarBanco(DynamicPropertyRegistry propriedades) {
        propriedades.add("spring.datasource.url", () -> banco.getJdbcUrl("postgres", "postgres"));
        propriedades.add("spring.datasource.username", () -> "postgres");
        propriedades.add("spring.datasource.password", () -> "");
    }
}
