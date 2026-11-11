package br.com.packrule.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "arquivo_embalagem")
public class ArquivoEmbalagem {

    @Id
    @Column(name = "versao_embalagem_id")
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "versao_embalagem_id")
    private VersaoEmbalagem versaoEmbalagem;

    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] conteudo;

    protected ArquivoEmbalagem() {
    }

    public ArquivoEmbalagem(VersaoEmbalagem versaoEmbalagem, byte[] conteudo) {
        this.versaoEmbalagem = versaoEmbalagem;
        this.conteudo = conteudo.clone();
    }

    public byte[] getConteudo() {
        return conteudo.clone();
    }
}
