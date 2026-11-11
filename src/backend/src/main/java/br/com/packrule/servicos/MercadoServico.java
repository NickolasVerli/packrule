package br.com.packrule.servicos;

import br.com.packrule.excecoes.DadosInvalidosException;
import br.com.packrule.modelo.Mercado;
import br.com.packrule.repositorios.MercadoRepositorio;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MercadoServico {

    private final MercadoRepositorio mercados;

    public MercadoServico(MercadoRepositorio mercados) {
        this.mercados = mercados;
    }

    public Set<Mercado> obterTodos(Set<UUID> identificadores) {
        Set<Mercado> encontrados = new LinkedHashSet<>(mercados.findAllById(identificadores));
        if (encontrados.size() != identificadores.size()) {
            throw new DadosInvalidosException("Um ou mais mercados não foram encontrados.");
        }
        return encontrados;
    }
}
