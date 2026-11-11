package br.com.packrule.modelo;

import br.com.packrule.dto.DadosRegra;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.hibernate.annotations.BatchSize;

@Entity
@Table(name = "regra_regulatoria")
public class Regra {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 80)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_regra", nullable = false, length = 30)
    private TipoRegra tipo;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(nullable = false, length = 4000)
    private String descricao;

    @Column(name = "fonte_legal", nullable = false, length = 2000)
    private String fonteLegal;

    @Column(nullable = false, length = 80)
    private String categoria;

    @Column(name = "inicio_vigencia", nullable = false)
    private LocalDate inicioVigencia;

    @Column(name = "fim_vigencia")
    private LocalDate fimVigencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "severidade_padrao", nullable = false, length = 20)
    private Severidade severidade;

    @Column(nullable = false)
    private boolean ativa;

    @Column(nullable = false)
    private boolean excluida;

    @Column(name = "campo_alvo", nullable = false, length = 80)
    private String campoAlvo = "textoExtraido";

    @Column(name = "idioma_esperado", nullable = false, length = 10)
    private String idiomaEsperado = "";

    @ElementCollection
    @CollectionTable(name = "regra_termo", joinColumns = @JoinColumn(name = "regra_id"))
    @Column(name = "termo", nullable = false, length = 200)
    @OrderColumn(name = "ordem")
    @BatchSize(size = 100)
    private List<String> termos = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "regra_mercado", joinColumns = @JoinColumn(name = "regra_id"),
            inverseJoinColumns = @JoinColumn(name = "mercado_id"))
    @BatchSize(size = 100)
    private Set<Mercado> mercados = new LinkedHashSet<>();

    protected Regra() {
    }

    public Regra(DadosRegra dados, Set<Mercado> mercados, List<String> termos) {
        this.codigo = "REGRA-" + UUID.randomUUID();
        atualizar(dados, mercados, termos);
    }

    public void atualizar(DadosRegra dados, Set<Mercado> mercados, List<String> termos) {
        if (dados.codigo() != null && !dados.codigo().isBlank()) {
            this.codigo = dados.codigo().strip();
        }
        this.titulo = dados.titulo().strip();
        this.descricao = dados.descricao().strip();
        this.tipo = dados.tipo();
        this.categoria = dados.categoria().strip();
        this.fonteLegal = dados.fonteLegal().strip();
        this.severidade = dados.severidade();
        this.inicioVigencia = dados.inicioVigencia();
        this.fimVigencia = dados.fimVigencia();
        this.ativa = dados.ativa() == null || dados.ativa();
        this.idiomaEsperado = dados.idiomaEsperado() == null ? "" : dados.idiomaEsperado().strip();
        this.termos.clear();
        this.termos.addAll(termos);
        this.mercados.clear();
        this.mercados.addAll(mercados);
    }

    public void excluir() {
        this.excluida = true;
        this.ativa = false;
    }

    public UUID getId() { return id; }
    public String getCodigo() { return codigo; }
    public TipoRegra getTipo() { return tipo; }
    public String getTitulo() { return titulo; }
    public String getDescricao() { return descricao; }
    public String getFonteLegal() { return fonteLegal; }
    public String getCategoria() { return categoria; }
    public LocalDate getInicioVigencia() { return inicioVigencia; }
    public LocalDate getFimVigencia() { return fimVigencia; }
    public Severidade getSeveridade() { return severidade; }
    public boolean isAtiva() { return ativa; }
    public boolean isExcluida() { return excluida; }
    public String getIdiomaEsperado() { return idiomaEsperado; }
    public List<String> getTermos() { return List.copyOf(termos); }
    public Set<Mercado> getMercados() { return Set.copyOf(mercados); }
}
