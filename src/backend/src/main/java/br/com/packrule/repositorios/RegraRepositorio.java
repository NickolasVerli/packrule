package br.com.packrule.repositorios;

import br.com.packrule.modelo.Regra;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegraRepositorio extends JpaRepository<Regra, UUID> {

    Page<Regra> findByExcluidaFalse(Pageable paginacao);

    Optional<Regra> findByIdAndExcluidaFalse(UUID id);

    @Query("""
            select distinct regra from Regra regra join regra.mercados mercado
            where regra.excluida = false and regra.ativa = true
            and mercado.id in :mercados
            and (regra.categoria = 'ALL' or regra.categoria = :categoria)
            and regra.inicioVigencia <= :data
            and (regra.fimVigencia is null or regra.fimVigencia >= :data)
            """)
    List<Regra> buscarAplicaveis(@Param("mercados") Set<UUID> mercados,
            @Param("categoria") String categoria, @Param("data") LocalDate data);
}
