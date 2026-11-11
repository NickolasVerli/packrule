package br.com.packrule;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.ByteArrayOutputStream;
import java.awt.image.BufferedImage;
import java.util.Arrays;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import javax.imageio.ImageIO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class FluxoAnaliseIntegracaoTest extends BancoIntegracao {

    private static final String franca = "00000000-0000-0000-0000-000000000001";
    private static final String alemanha = "00000000-0000-0000-0000-000000000002";

    @Autowired
    private MockMvc cliente;

    @Autowired
    private ObjectMapper conversor;

    @Autowired
    private JdbcTemplate consultas;

    @BeforeEach
    void limparRegistros() {
        consultas.update("DELETE FROM produto");
        consultas.update("DELETE FROM regra_regulatoria");
    }

    @Test
    void armazenaArquivoExtraiPdfEConservaNumeracaoDasVersoes() throws Exception {
        String produtoId = criarProduto();
        byte[] arquivo = criarPdf("Fabricante PackRule - conteudo 100 g");
        JsonNode primeira = enviarArquivo(produtoId, arquivo, "");
        assertThat(primeira.get("number").asInt()).isEqualTo(1);
        assertThat(primeira.get("extractedText").asText()).contains("Fabricante PackRule");
        assertThat(primeira.get("extractionStatus").asText()).isEqualTo("EXTRAIDO");

        String primeiraId = primeira.get("id").asText();
        cliente.perform(get("/api/embalagens/{id}/arquivo", primeiraId))
                .andExpect(status().isOk()).andExpect(content().bytes(arquivo));
        JsonNode segunda = enviarArquivo(produtoId, arquivo, "Texto revisado");
        assertThat(segunda.get("number").asInt()).isEqualTo(2);
        cliente.perform(delete("/api/embalagens/{id}", segunda.get("id").asText()))
                .andExpect(status().isNoContent());
        assertThat(enviarArquivo(produtoId, arquivo, "").get("number").asInt()).isEqualTo(3);
        cliente.perform(get("/api/produtos/{id}/embalagens", produtoId))
                .andExpect(jsonPath("$.length()").value(2));
        cliente.perform(patch("/api/embalagens/{id}/texto", primeiraId)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"extractedText\":\"Conteúdo revisado\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.extractedText").value("Conteúdo revisado"));
    }

    @Test
    void rejeitaArquivosInvalidosSemCriarVersoes() throws Exception {
        String produtoId = criarProduto();
        for (MockMultipartFile arquivo : new MockMultipartFile[] {
                new MockMultipartFile("arquivo", "vazio.pdf", "application/pdf", new byte[0]),
                new MockMultipartFile("arquivo", "falso.pdf", "application/pdf", "invalido".getBytes()),
                new MockMultipartFile("arquivo", "falso.png", "image/png", criarPdf("Produto")),
                new MockMultipartFile("arquivo", "invalido.txt", "text/plain", "texto".getBytes())}) {
            cliente.perform(multipart("/api/produtos/{id}/embalagens", produtoId).file(arquivo))
                    .andExpect(status().isBadRequest());
        }
        cliente.perform(multipart("/api/produtos/{id}/embalagens", produtoId)
                        .file(new MockMultipartFile("arquivo", "grande.pdf", "application/pdf",
                                new byte[10 * 1024 * 1024 + 1])))
                .andExpect(status().isPayloadTooLarge());
        cliente.perform(multipart("/api/produtos/{id}/embalagens", UUID.randomUUID())
                        .file(new MockMultipartFile("arquivo", "rotulo.pdf", "application/pdf", criarPdf("Produto"))))
                .andExpect(status().isNotFound());
        assertThat(consultas.queryForObject("SELECT count(*) FROM versao_embalagem", Long.class)).isZero();
    }

    @Test
    void indicaRevisaoManualParaImagemSemOcr() throws Exception {
        byte[] imagem = criarImagem("png");
        cliente.perform(multipart("/api/produtos/{id}/embalagens", criarProduto())
                        .file(new MockMultipartFile("arquivo", "rotulo.png", "image/png", imagem)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.extractedText").value(""))
                .andExpect(jsonPath("$.extractionStatus").value("REVISAO_NECESSARIA"))
                .andExpect(jsonPath("$.extractionMessage").isNotEmpty());
    }

    @Test
    void rejeitaImagensTruncadasMesmoComTextoRevisado() throws Exception {
        String produtoId = criarProduto();
        for (String formato : new String[] {"png", "jpeg"}) {
            byte[] truncado = Arrays.copyOf(criarImagem(formato), 33);
            for (String texto : new String[] {"", "Fabricante PackRule"}) {
                cliente.perform(multipart("/api/produtos/{id}/embalagens", produtoId)
                                .file(new MockMultipartFile("arquivo", "rotulo." + formato, "image/" + formato, truncado))
                                .param("textoExtraido", texto))
                        .andExpect(status().isBadRequest());
            }
        }
        assertThat(consultas.queryForObject("SELECT count(*) FROM versao_embalagem", Long.class)).isZero();
        assertThat(consultas.queryForObject("SELECT count(*) FROM arquivo_embalagem", Long.class)).isZero();
    }

    @Test
    void cadastraEditaMudaTipoEExcluiRegras() throws Exception {
        ObjectNode dados = dadosRegra("INFORMATION_PRESENCE", "CRITICAL", "fabricante");
        JsonNode regra = criarRegra(dados);
        String id = regra.get("id").asText();
        cliente.perform(get("/api/regras/{id}", id)).andExpect(status().isOk());
        dados.put("type", "LANGUAGE");
        dados.putArray("terms").add("contenu").add("fabrique");
        cliente.perform(put("/api/regras/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON).content(dados.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.type").value("LANGUAGE"));
        cliente.perform(delete("/api/regras/{id}", id)).andExpect(status().isNoContent());
        cliente.perform(get("/api/regras/{id}", id)).andExpect(status().isNotFound());
        cliente.perform(get("/api/regras")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void selecionaRegrasPorMercadoCategoriaEVigenciaEUsaPolimorfismo() throws Exception {
        String produtoId = criarProduto();
        String versaoId = enviarArquivo(produtoId, criarPdf("Fabricante PackRule"), "").get("id").asText();
        ObjectNode presenca = dadosRegra("INFORMATION_PRESENCE", "CRITICAL", "fabricante");
        presenca.put("startDate", "2026-01-01").put("endDate", "2026-12-31");
        criarRegra(presenca);
        criarRegra(dadosRegra("INFORMATION_PRESENCE", "WARNING", "lote"));
        ObjectNode idioma = dadosRegra("LANGUAGE", "CRITICAL", "contenu");
        idioma.withArray("terms").add("fabrique");
        criarRegra(idioma);
        criarRegra(dadosRegra("INFORMATION_PRESENCE", "CRITICAL", "ignorar").put("startDate", "2027-01-01"));
        criarRegra(dadosRegra("INFORMATION_PRESENCE", "CRITICAL", "ignorar").put("endDate", "2025-12-31"));
        criarRegra(dadosRegra("INFORMATION_PRESENCE", "CRITICAL", "ignorar").put("category", "Cosméticos"));
        ObjectNode outroMercado = dadosRegra("INFORMATION_PRESENCE", "CRITICAL", "ignorar");
        outroMercado.putArray("marketIds").add(alemanha);
        criarRegra(outroMercado);

        JsonNode analise = analisar(versaoId, "2026-01-01");
        assertThat(analise.get("findings")).hasSize(3);
        assertThat(analise.get("findings").findValuesAsText("classification"))
                .containsExactlyInAnyOrder("PASSED", "WARNING", "CRITICAL");
        for (JsonNode achado : analise.get("findings")) {
            assertThat(achado.get("marketId").asText()).isEqualTo(franca);
            assertThat(achado.get("source").asText()).isEqualTo("Regra de demonstração acadêmica");
            assertThat(achado.get("ruleTitle").asText()).isNotBlank();
        }
        assertThat(analisar(versaoId, "2026-12-31").get("findings")).hasSize(3);
        cliente.perform(get("/api/analises/{id}", analise.get("id").asText()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.findings.length()").value(3));
        cliente.perform(get("/api/analises").param("produtoId", produtoId))
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void mantemHistoricoAposRevisarTextoEditarOuExcluirRegra() throws Exception {
        String versaoId = enviarArquivo(criarProduto(), criarPdf("Fabricante PackRule"), "").get("id").asText();
        ObjectNode dados = dadosRegra("INFORMATION_PRESENCE", "CRITICAL", "fabricante");
        String regraId = criarRegra(dados).get("id").asText();
        JsonNode analise = analisar(versaoId, "2026-11-11");
        String tituloOriginal = analise.get("findings").get(0).get("ruleTitle").asText();
        cliente.perform(patch("/api/embalagens/{id}/texto", versaoId)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"extractedText\":\"\"}"))
                .andExpect(status().isOk());
        assertThat(analisar(versaoId, "2026-11-11").get("findings").get(0).get("classification").asText())
                .isEqualTo("MANUAL_REVIEW");
        dados.put("title", "Título atualizado").put("source", "Outra fonte");
        cliente.perform(put("/api/regras/{id}", regraId)
                        .contentType(MediaType.APPLICATION_JSON).content(dados.toString()))
                .andExpect(status().isOk());
        cliente.perform(delete("/api/regras/{id}", regraId)).andExpect(status().isNoContent());
        cliente.perform(get("/api/analises/{id}", analise.get("id").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.findings[0].classification").value("PASSED"))
                .andExpect(jsonPath("$.findings[0].ruleTitle").value(tituloOriginal))
                .andExpect(jsonPath("$.findings[0].source").value("Regra de demonstração acadêmica"));
        assertThat(analisar(versaoId, "2026-11-11").get("findings")).isEmpty();
    }

    @Test
    void validaRegrasEContextoDaAnaliseNoServidor() throws Exception {
        ObjectNode dados = dadosRegra("INFORMATION_PRESENCE", "CRITICAL", "fabricante");
        dados.put("source", " ");
        enviarRegra(dados).andExpect(status().isBadRequest());
        dados.put("source", "Fonte").put("endDate", "2020-01-01");
        enviarRegra(dados).andExpect(status().isBadRequest());
        dados.put("endDate", "");
        dados.putArray("marketIds").add(UUID.randomUUID().toString());
        enviarRegra(dados).andExpect(status().isBadRequest());
        dados.putArray("marketIds").add(franca);
        dados.putArray("terms").add("fabricante").add("FABRICANTE");
        dados.put("type", "LANGUAGE");
        enviarRegra(dados).andExpect(status().isBadRequest());
        for (String requisicao : new String[] {
                "{}", "{\"marketIds\":[],\"referenceDate\":\"2026-11-11\"}",
                "{\"versionId\":\"" + UUID.randomUUID() + "\",\"marketIds\":[\"" + franca
                        + "\"],\"referenceDate\":\"2026-11-11\"}"}) {
            cliente.perform(post("/api/analises").contentType(MediaType.APPLICATION_JSON).content(requisicao))
                    .andExpect(status().is4xxClientError());
        }
    }

    @Test
    void excluiProdutoComTodasAsVersoesArquivosAnalisesEAchados() throws Exception {
        String produtoId = criarProduto();
        String versaoId = enviarArquivo(produtoId, criarPdf("Fabricante PackRule"), "").get("id").asText();
        criarRegra(dadosRegra("INFORMATION_PRESENCE", "CRITICAL", "fabricante"));
        String analiseId = analisar(versaoId, "2026-11-11").get("id").asText();
        cliente.perform(delete("/api/produtos/{id}", produtoId)).andExpect(status().isNoContent());
        cliente.perform(get("/api/analises/{id}", analiseId)).andExpect(status().isNotFound());
        cliente.perform(get("/api/embalagens/{id}/arquivo", versaoId)).andExpect(status().isNotFound());
        for (String tabela : new String[] {"produto", "versao_embalagem", "arquivo_embalagem", "analise_conformidade", "achado", "analise_mercado"}) {
            assertThat(consultas.queryForObject("SELECT count(*) FROM " + tabela, Long.class)).isZero();
        }
    }

    @Test
    void numeraCorretamenteUploadsConcorrentes() throws Exception {
        String produtoId = criarProduto();
        byte[] arquivo = criarPdf("Fabricante PackRule");
        CompletableFuture<JsonNode> primeira = CompletableFuture.supplyAsync(() -> enviarSemExcecao(produtoId, arquivo));
        CompletableFuture<JsonNode> segunda = CompletableFuture.supplyAsync(() -> enviarSemExcecao(produtoId, arquivo));
        assertThat(new int[] {primeira.get().get("number").asInt(), segunda.get().get("number").asInt()})
                .containsExactlyInAnyOrder(1, 2);
    }

    private JsonNode enviarSemExcecao(String produtoId, byte[] arquivo) {
        try {
            return enviarArquivo(produtoId, arquivo, "");
        } catch (Exception erro) {
            throw new IllegalStateException(erro);
        }
    }

    private String criarProduto() throws Exception {
        String resposta = cliente.perform(post("/api/produtos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Sabão\",\"category\":\"Limpeza\",\"description\":\"Teste\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return conversor.readTree(resposta).get("id").asText();
    }

    private JsonNode enviarArquivo(String produtoId, byte[] arquivo, String texto) throws Exception {
        String resposta = cliente.perform(multipart("/api/produtos/{id}/embalagens", produtoId)
                        .file(new MockMultipartFile("arquivo", "rotulo.pdf", "application/pdf", arquivo))
                        .param("material", "Papel").param("quantidadeDeclarada", "100 g").param("textoExtraido", texto))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return conversor.readTree(resposta);
    }

    private ObjectNode dadosRegra(String tipo, String severidade, String termo) {
        ObjectNode dados = conversor.createObjectNode();
        dados.put("title", "Regra " + UUID.randomUUID()).put("description", "Descrição da regra")
                .put("type", tipo).put("severity", severidade).put("category", "ALL")
                .put("startDate", "2024-01-01").put("endDate", "")
                .put("source", "Regra de demonstração acadêmica");
        dados.putArray("terms").add(termo);
        dados.putArray("marketIds").add(franca);
        return dados;
    }

    private ResultActions enviarRegra(ObjectNode dados) throws Exception {
        return cliente.perform(post("/api/regras").contentType(MediaType.APPLICATION_JSON).content(dados.toString()));
    }

    private JsonNode criarRegra(ObjectNode dados) throws Exception {
        return conversor.readTree(enviarRegra(dados).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());
    }

    private JsonNode analisar(String versaoId, String data) throws Exception {
        ObjectNode dados = conversor.createObjectNode().put("versionId", versaoId).put("referenceDate", data);
        dados.putArray("marketIds").add(franca);
        return conversor.readTree(cliente.perform(post("/api/analises").contentType(MediaType.APPLICATION_JSON)
                        .content(dados.toString())).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());
    }

    private byte[] criarPdf(String texto) throws Exception {
        try (PDDocument documento = new PDDocument(); ByteArrayOutputStream saida = new ByteArrayOutputStream()) {
            PDPage pagina = new PDPage();
            documento.addPage(pagina);
            try (PDPageContentStream conteudo = new PDPageContentStream(documento, pagina)) {
                conteudo.beginText();
                conteudo.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                conteudo.newLineAtOffset(40, 700);
                conteudo.showText(texto);
                conteudo.endText();
            }
            documento.save(saida);
            return saida.toByteArray();
        }
    }

    private byte[] criarImagem(String formato) throws Exception {
        try (ByteArrayOutputStream saida = new ByteArrayOutputStream()) {
            BufferedImage imagem = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
            assertThat(ImageIO.write(imagem, formato, saida)).isTrue();
            return saida.toByteArray();
        }
    }
}
