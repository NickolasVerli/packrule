package br.com.packrule;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.text.Normalizer;
import java.util.Locale;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@EnabledIfSystemProperty(named = "packrule.testar-ocr", matches = "true")
class OcrIntegracaoTest extends BancoIntegracao {

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

    @ParameterizedTest
    @CsvSource({"png,image/png", "jpg,image/jpeg"})
    void extraiTextoDaImagemEPersisteNoBanco(String formato, String tipo) throws Exception {
        String respostaProduto = cliente.perform(post("/api/produtos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Produto OCR\",\"category\":\"Limpeza\",\"description\":\"Teste de leitura\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String produtoId = conversor.readTree(respostaProduto).get("id").asText();
        byte[] arquivo = criarRotulo(formato);
        String resposta = cliente.perform(multipart("/api/produtos/{id}/embalagens", produtoId)
                        .file(new MockMultipartFile("arquivo", "rotulo." + formato, tipo, arquivo)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        JsonNode versao = conversor.readTree(resposta);

        assertThat(versao.get("extractionStatus").asText())
                .withFailMessage("Esperado OCR automático: %s", versao.get("extractionMessage").asText())
                .isEqualTo("EXTRAIDO");
        String texto = versao.get("extractedText").asText();
        String textoNormalizado = Normalizer.normalize(texto.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        assertThat(textoNormalizado).contains("fabricante", "conteudo", "100", "reciclavel");

        UUID versaoId = UUID.fromString(versao.get("id").asText());
        assertThat(consultas.queryForObject("SELECT texto_extraido FROM versao_embalagem WHERE id = ?",
                String.class, versaoId)).isEqualTo(texto);
        cliente.perform(get("/api/embalagens/{id}/arquivo", versaoId))
                .andExpect(status().isOk()).andExpect(content().bytes(arquivo));
    }

    private byte[] criarRotulo(String formato) throws Exception {
        BufferedImage imagem = new BufferedImage(1100, 360, BufferedImage.TYPE_INT_RGB);
        Graphics2D desenho = imagem.createGraphics();
        try {
            desenho.setColor(Color.WHITE);
            desenho.fillRect(0, 0, imagem.getWidth(), imagem.getHeight());
            desenho.setColor(Color.BLACK);
            desenho.setFont(new Font("SansSerif", Font.PLAIN, 48));
            desenho.drawString("Fabricante PackRule", 50, 85);
            desenho.drawString("Conteúdo 100 g", 50, 175);
            desenho.drawString("Embalagem reciclável", 50, 265);
        } finally {
            desenho.dispose();
        }
        try (ByteArrayOutputStream saida = new ByteArrayOutputStream()) {
            assertThat(ImageIO.write(imagem, formato, saida)).isTrue();
            return saida.toByteArray();
        }
    }
}
