package br.com.packrule.repositorios;

import br.com.packrule.modelo.Produto;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProdutoRepositorio extends JpaRepository<Produto, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select produto from Produto produto where produto.id = :id")
    Optional<Produto> buscarParaAtualizacao(@Param("id") UUID id);
}
