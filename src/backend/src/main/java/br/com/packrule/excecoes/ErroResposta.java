package br.com.packrule.excecoes;

import java.time.Instant;
import java.util.Map;

public record ErroResposta(Instant instante, int status, String mensagem, Map<String, String> campos) {
}
