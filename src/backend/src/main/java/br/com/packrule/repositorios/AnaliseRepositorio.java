package br.com.packrule.repositorios;

import br.com.packrule.modelo.AnaliseConformidade;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnaliseRepositorio extends JpaRepository<AnaliseConformidade, UUID> {

    @Override
    @EntityGraph(attributePaths = "versaoEmbalagem.produto")
    Page<AnaliseConformidade> findAll(Pageable paginacao);

    @Override
    @EntityGraph(attributePaths = "versaoEmbalagem.produto")
    Optional<AnaliseConformidade> findById(UUID id);

    @EntityGraph(attributePaths = "versaoEmbalagem.produto")
    Page<AnaliseConformidade> findByVersaoEmbalagemProdutoId(UUID produtoId, Pageable paginacao);

    @EntityGraph(attributePaths = "versaoEmbalagem.produto")
    Page<AnaliseConformidade> findByVersaoEmbalagemId(UUID versaoId, Pageable paginacao);
}
