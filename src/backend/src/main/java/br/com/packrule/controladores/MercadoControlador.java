package br.com.packrule.controladores;

import br.com.packrule.dto.MercadoResposta;
import br.com.packrule.repositorios.MercadoRepositorio;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mercados")
public class MercadoControlador {

    private final MercadoRepositorio mercados;

    public MercadoControlador(MercadoRepositorio mercados) {
        this.mercados = mercados;
    }

    @GetMapping
    public List<MercadoResposta> listar() {
        return mercados.findAll(Sort.by("nome")).stream().map(MercadoResposta::de).toList();
    }
}
