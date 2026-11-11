package br.com.packrule.repositorios;

import br.com.packrule.modelo.ArquivoEmbalagem;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArquivoRepositorio extends JpaRepository<ArquivoEmbalagem, UUID> {
}
