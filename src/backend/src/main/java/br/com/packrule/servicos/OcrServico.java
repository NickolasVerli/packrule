package br.com.packrule.servicos;

import br.com.packrule.modelo.StatusExtracao;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OcrServico {

    private static final Logger registrador = LoggerFactory.getLogger(OcrServico.class);
    private final String comando;
    private final String idiomas;

    public OcrServico(@Value("${packrule.ocr.comando:}") String comando,
            @Value("${packrule.ocr.idiomas:eng}") String idiomas) {
        this.comando = comando;
        this.idiomas = idiomas;
    }

    public ExtracaoTexto extrair(byte[] conteudo) {
        if (comando.isBlank()) {
            return ExtracaoTexto.solicitarRevisao("OCR não configurado. Informe e revise o texto da imagem antes da análise.");
        }
        Path pasta = null;
        Process processo = null;
        try {
            pasta = Files.createTempDirectory("packrule-ocr-");
            Path entrada = pasta.resolve("embalagem");
            Path saida = pasta.resolve("texto");
            Files.write(entrada, conteudo);
            processo = new ProcessBuilder(comando, entrada.toString(), saida.toString(), "-l", idiomas)
                    .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                    .redirectError(ProcessBuilder.Redirect.DISCARD).start();
            if (!processo.waitFor(40, TimeUnit.SECONDS)) {
                processo.destroyForcibly();
                return ExtracaoTexto.solicitarRevisao("O OCR excedeu o tempo de leitura. Informe o texto manualmente.");
            }
            Path resultado = pasta.resolve("texto.txt");
            if (processo.exitValue() != 0 || !Files.isRegularFile(resultado)) {
                return ExtracaoTexto.solicitarRevisao("O OCR não conseguiu ler a imagem. Verifique os idiomas instalados ou informe o texto.");
            }
            if (Files.size(resultado) > 200000) {
                return ExtracaoTexto.solicitarRevisao("O OCR gerou conteúdo muito extenso. Informe até 50000 caracteres revisados.");
            }
            String texto = Files.readString(resultado, StandardCharsets.UTF_8).strip();
            if (texto.isBlank() || texto.length() > 50000) {
                return ExtracaoTexto.solicitarRevisao("O OCR não produziu texto suficiente para análise. Revise o conteúdo manualmente.");
            }
            return new ExtracaoTexto(texto, StatusExtracao.EXTRAIDO, "Texto extraído por OCR. Confira a leitura antes da análise.");
        } catch (IOException erro) {
            registrador.warn("Não foi possível executar o OCR: {}", erro.getClass().getSimpleName());
            return ExtracaoTexto.solicitarRevisao("Não foi possível executar o OCR. Confira OCR_COMANDO ou informe o texto manualmente.");
        } catch (InterruptedException erro) {
            Thread.currentThread().interrupt();
            if (processo != null) {
                processo.destroyForcibly();
            }
            return ExtracaoTexto.solicitarRevisao("A leitura por OCR foi interrompida. Revise o texto manualmente.");
        } finally {
            limparTemporarios(pasta);
        }
    }

    private void limparTemporarios(Path pasta) {
        if (pasta == null) {
            return;
        }
        try {
            Files.deleteIfExists(pasta.resolve("embalagem"));
            Files.deleteIfExists(pasta.resolve("texto.txt"));
            Files.deleteIfExists(pasta);
        } catch (IOException erro) {
            registrador.warn("Não foi possível remover os arquivos temporários do OCR: {}", erro.getClass().getSimpleName());
        }
    }
}
