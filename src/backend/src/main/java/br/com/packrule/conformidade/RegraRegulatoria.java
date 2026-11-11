package br.com.packrule.conformidade;

import br.com.packrule.modelo.Classificacao;
import br.com.packrule.modelo.Produto;
import br.com.packrule.modelo.Regra;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

public abstract class RegraRegulatoria {

    private static final Pattern acentos = Pattern.compile("\\p{M}+");
    protected final Regra regra;

    protected RegraRegulatoria(Regra regra) {
        this.regra = regra;
    }

    public boolean aplicaAo(Produto produto, UUID mercadoId, LocalDate dataReferencia) {
        return regra.isAtiva() && !regra.isExcluida()
                && regra.getMercados().stream().anyMatch(mercado -> mercado.getId().equals(mercadoId))
                && (regra.getCategoria().equals("ALL") || regra.getCategoria().equals(produto.getCategoria()))
                && !dataReferencia.isBefore(regra.getInicioVigencia())
                && (regra.getFimVigencia() == null || !dataReferencia.isAfter(regra.getFimVigencia()));
    }

    public abstract ResultadoRegra avaliar(String texto);

    protected ResultadoRegra avaliarTermos(String texto, int minimo, String mensagemFalha) {
        if (texto == null || texto.isBlank()) {
            return new ResultadoRegra(Classificacao.MANUAL_REVIEW,
                    "Não há texto suficiente para verificar esta regra. Revise o conteúdo da embalagem.", "");
        }
        String textoNormalizado = normalizar(texto);
        List<String> encontrados = regra.getTermos().stream()
                .filter(termo -> textoNormalizado.contains(normalizar(termo))).toList();
        if (encontrados.size() >= minimo) {
            return new ResultadoRegra(Classificacao.PASSED,
                    encontrados.size() + " termo(s) da regra encontrado(s) no texto da embalagem.",
                    String.join(", ", encontrados));
        }
        return new ResultadoRegra(Classificacao.valueOf(regra.getSeveridade().name()), mensagemFalha,
                String.join(", ", encontrados));
    }

    public static String normalizar(String texto) {
        return acentos.matcher(Normalizer.normalize(texto.strip().toLowerCase(Locale.ROOT), Normalizer.Form.NFD))
                .replaceAll("");
    }
}
