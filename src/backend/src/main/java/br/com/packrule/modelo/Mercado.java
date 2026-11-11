package br.com.packrule.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "mercado")
public class Mercado {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 3)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 100)
    private String regiao;

    @Column(name = "idioma_referencia", nullable = false, length = 10)
    private String idiomaReferencia;

    protected Mercado() {
    }

    public UUID getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNome() {
        return nome;
    }

    public String getRegiao() {
        return regiao;
    }

    public String getIdiomaReferencia() {
        return idiomaReferencia;
    }
}
