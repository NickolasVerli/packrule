package br.com.packrule.modelo;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.hibernate.annotations.BatchSize;

@Entity
@Table(name = "analise_conformidade")
public class AnaliseConformidade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "versao_embalagem_id", nullable = false)
    private VersaoEmbalagem versaoEmbalagem;

    @Column(name = "data_execucao", nullable = false)
    private Instant dataExecucao;

    @Column(name = "data_referencia", nullable = false)
    private LocalDate dataReferencia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusAnalise status;

    @Column(name = "texto_analisado", nullable = false, columnDefinition = "text")
    private String textoAnalisado;

    @Column(name = "nome_produto", nullable = false, length = 160)
    private String nomeProduto;

    @Column(name = "categoria_produto", nullable = false, length = 80)
    private String categoriaProduto;

    @ManyToMany
    @JoinTable(name = "analise_mercado", joinColumns = @JoinColumn(name = "analise_id"),
            inverseJoinColumns = @JoinColumn(name = "mercado_id"))
    @BatchSize(size = 100)
    private Set<Mercado> mercados = new LinkedHashSet<>();

    @OneToMany(mappedBy = "analise", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100)
    private List<Achado> achados = new ArrayList<>();

    protected AnaliseConformidade() {
    }

    public AnaliseConformidade(VersaoEmbalagem versao, Set<Mercado> mercados, LocalDate dataReferencia) {
        this.versaoEmbalagem = versao;
        this.mercados.addAll(mercados);
        this.dataReferencia = dataReferencia;
        this.dataExecucao = Instant.now();
        this.status = StatusAnalise.CONCLUIDA;
        this.textoAnalisado = versao.getTextoExtraido();
        this.nomeProduto = versao.getProduto().getNome();
        this.categoriaProduto = versao.getProduto().getCategoria();
    }

    public void adicionarAchado(Achado achado) {
        achados.add(achado);
    }

    public UUID getId() { return id; }
    public VersaoEmbalagem getVersaoEmbalagem() { return versaoEmbalagem; }
    public Instant getDataExecucao() { return dataExecucao; }
    public LocalDate getDataReferencia() { return dataReferencia; }
    public StatusAnalise getStatus() { return status; }
    public String getTextoAnalisado() { return textoAnalisado; }
    public String getNomeProduto() { return nomeProduto; }
    public String getCategoriaProduto() { return categoriaProduto; }
    public Set<Mercado> getMercados() { return Set.copyOf(mercados); }
    public List<Achado> getAchados() { return List.copyOf(achados); }
}
