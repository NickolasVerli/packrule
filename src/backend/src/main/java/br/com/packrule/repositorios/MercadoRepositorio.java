package br.com.packrule.repositorios;

import br.com.packrule.modelo.Mercado;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MercadoRepositorio extends JpaRepository<Mercado, UUID> {
}
