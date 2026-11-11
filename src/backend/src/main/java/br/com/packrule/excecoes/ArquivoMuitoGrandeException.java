package br.com.packrule.excecoes;

public class ArquivoMuitoGrandeException extends RuntimeException {

    public ArquivoMuitoGrandeException() {
        super("O arquivo excede o limite de 10 MB.");
    }
}
