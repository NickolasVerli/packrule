package br.com.packrule.excecoes;

import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class TratadorExcecoes {

    private static final Logger registrador = LoggerFactory.getLogger(TratadorExcecoes.class);

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    ResponseEntity<ErroResposta> tratarNaoEncontrado(RecursoNaoEncontradoException erro) {
        return responder(HttpStatus.NOT_FOUND, erro.getMessage(), Map.of());
    }

    @ExceptionHandler(DadosInvalidosException.class)
    ResponseEntity<ErroResposta> tratarDadosInvalidos(DadosInvalidosException erro) {
        return responder(HttpStatus.BAD_REQUEST, erro.getMessage(), Map.of());
    }

    @ExceptionHandler(BindException.class)
    ResponseEntity<ErroResposta> tratarValidacao(BindException erro) {
        Map<String, String> campos = new LinkedHashMap<>();
        erro.getBindingResult().getFieldErrors().forEach(campo ->
                campos.putIfAbsent(campo.getField(), campo.getDefaultMessage()));
        String mensagem = campos.values().stream().findFirst().orElse("Revise os dados informados.");
        return responder(HttpStatus.BAD_REQUEST, mensagem, campos);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class, MissingServletRequestPartException.class,
            HandlerMethodValidationException.class, ConstraintViolationException.class})
    ResponseEntity<ErroResposta> tratarRequisicaoInvalida(Exception erro) {
        return responder(HttpStatus.BAD_REQUEST,
                "Requisição inválida. Verifique os campos, identificadores e datas informados.", Map.of());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ErroResposta> tratarLimiteArquivo(MaxUploadSizeExceededException erro) {
        return responder(HttpStatus.PAYLOAD_TOO_LARGE, "O arquivo excede o limite de 10 MB.", Map.of());
    }

    @ExceptionHandler(ArquivoMuitoGrandeException.class)
    ResponseEntity<ErroResposta> tratarArquivoGrande(ArquivoMuitoGrandeException erro) {
        return responder(HttpStatus.PAYLOAD_TOO_LARGE, erro.getMessage(), Map.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErroResposta> tratarConflito(DataIntegrityViolationException erro) {
        return responder(HttpStatus.CONFLICT,
                "O registro já existe ou possui vínculos que impedem esta operação.", Map.of());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ErroResposta> tratarRotaInexistente(NoResourceFoundException erro) {
        return responder(HttpStatus.NOT_FOUND, "Recurso não encontrado.", Map.of());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErroResposta> tratarFalhaInesperada(Exception erro) {
        registrador.error("Não foi possível concluir a operação.", erro);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR,
                "Não foi possível concluir a operação. Tente novamente.", Map.of());
    }

    private ResponseEntity<ErroResposta> responder(HttpStatus status, String mensagem, Map<String, String> campos) {
        return ResponseEntity.status(status)
                .body(new ErroResposta(Instant.now(), status.value(), mensagem, campos));
    }
}
