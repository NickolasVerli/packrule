package br.com.packrule.servicos;

import br.com.packrule.excecoes.ArquivoMuitoGrandeException;
import br.com.packrule.excecoes.DadosInvalidosException;
import br.com.packrule.modelo.StatusExtracao;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.Locale;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LeituraEmbalagemServico {

    private static final long tamanhoMaximo = 10L * 1024 * 1024;
    private final OcrServico ocr;

    public LeituraEmbalagemServico(OcrServico ocr) {
        this.ocr = ocr;
    }

    public ArquivoValidado validar(MultipartFile arquivo) {
        if (arquivo.isEmpty()) {
            throw new DadosInvalidosException("Selecione um arquivo de embalagem que não esteja vazio.");
        }
        if (arquivo.getSize() > tamanhoMaximo) {
            throw new ArquivoMuitoGrandeException();
        }
        String nome = arquivo.getOriginalFilename();
        if (nome == null || nome.isBlank()) {
            throw new DadosInvalidosException("Informe o nome do arquivo da embalagem.");
        }
        nome = nome.replace('\\', '/');
        nome = nome.substring(nome.lastIndexOf('/') + 1).replaceAll("\\p{Cntrl}", "").strip();
        if (nome.isBlank() || nome.length() > 255) {
            throw new DadosInvalidosException("O nome do arquivo deve ter entre 1 e 255 caracteres.");
        }
        String extensao = nome.substring(nome.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        String tipo = switch (extensao) {
            case "pdf" -> "application/pdf";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            default -> throw new DadosInvalidosException("Formato inválido. Envie um arquivo PDF, PNG ou JPG.");
        };
        if (arquivo.getContentType() != null && !arquivo.getContentType().equals(tipo)
                && !arquivo.getContentType().equals("application/octet-stream")) {
            throw new DadosInvalidosException("O conteúdo do arquivo não corresponde ao formato informado.");
        }
        try {
            byte[] conteudo = arquivo.getBytes();
            if (tipo.equals("application/pdf")) {
                if (conteudo.length < 5 || conteudo[0] != '%' || conteudo[1] != 'P'
                        || conteudo[2] != 'D' || conteudo[3] != 'F' || conteudo[4] != '-') {
                    throw new DadosInvalidosException("O arquivo não contém um PDF válido.");
                }
            } else {
                validarImagem(conteudo, extensao);
            }
            return new ArquivoValidado(nome, tipo, conteudo);
        } catch (IOException erro) {
            throw new DadosInvalidosException("Não foi possível ler o arquivo enviado. Verifique se ele está íntegro.");
        }
    }

    public ExtracaoTexto extrair(ArquivoValidado arquivo, String textoInformado) {
        if (arquivo.tipo().equals("application/pdf")) {
            try (PDDocument documento = Loader.loadPDF(arquivo.conteudo())) {
                if (documento.isEncrypted() || documento.getNumberOfPages() == 0 || documento.getNumberOfPages() > 20) {
                    throw new DadosInvalidosException("Envie um PDF sem senha e com 1 a 20 páginas.");
                }
                if (textoInformado != null && !textoInformado.isBlank()) {
                    return textoRevisado(textoInformado);
                }
                String texto = new PDFTextStripper().getText(documento).strip();
                if (texto.isBlank() || texto.length() > 50000) {
                    return ExtracaoTexto.solicitarRevisao("O PDF não possui texto legível ou excede 50000 caracteres. Informe o texto revisado.");
                }
                return new ExtracaoTexto(texto, StatusExtracao.EXTRAIDO, "Texto extraído do PDF. Confira a leitura antes da análise.");
            } catch (IOException erro) {
                throw new DadosInvalidosException("Não foi possível ler o PDF. Envie um documento íntegro e sem senha.");
            }
        }
        return textoInformado != null && !textoInformado.isBlank() ? textoRevisado(textoInformado) : ocr.extrair(arquivo.conteudo());
    }

    private ExtracaoTexto textoRevisado(String texto) {
        return new ExtracaoTexto(texto.strip(), StatusExtracao.REVISADO, "Texto informado pelo usuário para a verificação.");
    }

    private void validarImagem(byte[] conteudo, String extensao) throws IOException {
        try (ImageInputStream entrada = ImageIO.createImageInputStream(new ByteArrayInputStream(conteudo))) {
            Iterator<ImageReader> leitores = ImageIO.getImageReaders(entrada);
            if (!leitores.hasNext()) {
                throw new DadosInvalidosException("O arquivo não contém uma imagem válida.");
            }
            ImageReader leitor = leitores.next();
            try {
                leitor.setInput(entrada);
                String formato = leitor.getFormatName().toLowerCase(Locale.ROOT);
                boolean formatoCorreto = extensao.equals("png") ? formato.equals("png") : formato.equals("jpeg");
                if (!formatoCorreto || (long) leitor.getWidth(0) * leitor.getHeight(0) > 25000000) {
                    throw new DadosInvalidosException("Envie uma imagem PNG ou JPG válida com até 25 milhões de pixels.");
                }
            } finally {
                leitor.dispose();
            }
        }
    }
}
