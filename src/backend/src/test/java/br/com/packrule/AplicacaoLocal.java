package br.com.packrule;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.nio.file.Path;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

public class AplicacaoLocal {

    public static void main(String[] argumentos) {
        SpringApplication.from(AplicacaoPackrule::main).with(ConfiguracaoBancoLocal.class).run(argumentos);
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class ConfiguracaoBancoLocal {

        @Bean(destroyMethod = "close")
        EmbeddedPostgres bancoLocal() throws IOException {
            return EmbeddedPostgres.builder()
                    .setDataDirectory(Path.of("../../.temporario/banco-local").toAbsolutePath().normalize())
                    .setCleanDataDirectory(false)
                    .setRegisterShutdownHook(false)
                    .setPort(54329)
                    .setLocaleConfig("locale", "C")
                    .setLocaleConfig("encoding", "UTF-8")
                    .setServerConfig("listen_addresses", "127.0.0.1")
                    .setServerConfig("synchronous_commit", "on")
                    .start();
        }

        @Bean(destroyMethod = "close")
        HikariDataSource fonteDados(EmbeddedPostgres bancoLocal) {
            HikariConfig configuracao = new HikariConfig();
            configuracao.setJdbcUrl(bancoLocal.getJdbcUrl("postgres", "postgres"));
            configuracao.setUsername("postgres");
            configuracao.setPassword("");
            configuracao.setMaximumPoolSize(5);
            return new HikariDataSource(configuracao);
        }
    }
}
