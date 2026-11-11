package br.com.packrule.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "produto")
public class Produto {

    @Id
    private UUID id;

    @Column(length = 80, unique = true)
    private String sku;

    @Column(nullable = false, length = 160)
    private String nome;

    @Column(nullable = false, length = 80)
    private String categoria;

    @Column(nullable = false, length = 4000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusProduto status;

    @Column(name = "proxima_versao", nullable = false)
    private int proximaVersao = 1;

    protected Produto() {
    }

    public Produto(String nome, String categoria, String descricao, String sku, StatusProduto status) {
        this.id = UUID.randomUUID();
        atualizar(nome, categoria, descricao, sku, status);
    }

    public void atualizar(String nome, String categoria, String descricao, String sku, StatusProduto status) {
        this.nome = nome.strip();
        this.categoria = categoria.strip();
        this.descricao = descricao == null ? "" : descricao.strip();
        this.sku = sku == null || sku.isBlank() ? null : sku.strip();
        this.status = status == null ? StatusProduto.ATIVO : status;
    }

    public int reservarNumeroVersao() {
        return proximaVersao++;
    }

    public UUID getId() {
        return id;
    }

    public String getSku() {
        return sku;
    }

    public String getNome() {
        return nome;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getDescricao() {
        return descricao;
    }

    public StatusProduto getStatus() {
        return status;
    }
}
