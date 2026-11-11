package br.com.packrule.repositorios;

import br.com.packrule.modelo.VersaoEmbalagem;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmbalagemRepositorio extends JpaRepository<VersaoEmbalagem, UUID> {

    Page<VersaoEmbalagem> findByProdutoId(UUID produtoId, Pageable paginacao);
}
