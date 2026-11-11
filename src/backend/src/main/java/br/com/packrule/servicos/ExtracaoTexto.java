package br.com.packrule.servicos;

import br.com.packrule.modelo.StatusExtracao;

public record ExtracaoTexto(String texto, StatusExtracao status, String mensagem) {

    public static ExtracaoTexto solicitarRevisao(String mensagem) {
        return new ExtracaoTexto("", StatusExtracao.REVISAO_NECESSARIA, mensagem);
    }
}
