package br.com.packrule;

import static org.hamcrest.Matchers.hasItem;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ProdutosIntegracaoTest extends BancoIntegracao {

    @Autowired
    private MockMvc cliente;

    @Autowired
    private ObjectMapper conversor;

    @Autowired
    private JdbcTemplate consultas;

    @BeforeEach
    void limparProdutos() {
        consultas.update("DELETE FROM produto");
    }

    @Test
    void executaCrudCompletoComPersistenciaNoPostgresql() throws Exception {
        String resposta = cliente.perform(post("/api/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":" Sabão ","category":"Limpeza","description":" Descrição "}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Sabão"))
                .andExpect(jsonPath("$.description").value("Descrição"))
                .andReturn().getResponse().getContentAsString();

        JsonNode produto = conversor.readTree(resposta);
        String identificador = produto.get("id").asText();
        assertThat(consultas.queryForObject("SELECT nome FROM produto WHERE id = ?", String.class,
                UUID.fromString(identificador))).isEqualTo("Sabão");

        cliente.perform(get("/api/produtos")).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(identificador));
        cliente.perform(get("/api/produtos/{id}", identificador)).andExpect(status().isOk());
        cliente.perform(put("/api/produtos/{id}", identificador)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Sabão novo","category":"Limpeza","description":"Alterado"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Sabão novo"));

        cliente.perform(delete("/api/produtos/{id}", identificador)).andExpect(status().isNoContent());
        cliente.perform(get("/api/produtos/{id}", identificador)).andExpect(status().isNotFound());
        assertThat(consultas.queryForObject("SELECT count(*) FROM produto", Long.class)).isZero();
    }

    @Test
    void rejeitaDadosObrigatoriosEIdentificadoresInvalidos() throws Exception {
        cliente.perform(post("/api/produtos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\" \",\"category\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").isNotEmpty());
        cliente.perform(get("/api/produtos/invalido")).andExpect(status().isBadRequest());
        cliente.perform(put("/api/produtos/{id}", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Teste\",\"category\":\"Outros\"}"))
                .andExpect(status().isNotFound());
        cliente.perform(delete("/api/produtos/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    void disponibilizaMercadosCadastradosNoBanco() throws Exception {
        cliente.perform(get("/api/mercados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[?(@.code == 'BR')].name").value(hasItem("Brasil")))
                .andExpect(jsonPath("$[?(@.code == 'BR')].referenceLanguage").value(hasItem("pt")));
        assertThat(consultas.queryForObject("SELECT count(*) FROM mercado", Long.class)).isEqualTo(4L);
    }
}
