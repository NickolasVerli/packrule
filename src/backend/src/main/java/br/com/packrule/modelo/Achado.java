package br.com.packrule.modelo;

import br.com.packrule.conformidade.ResultadoRegra;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "achado")
public class Achado {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analise_id", nullable = false)
    private AnaliseConformidade analise;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "regra_id", nullable = false)
    private Regra regra;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mercado_id", nullable = false)
    private Mercado mercado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severidade severidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Classificacao classificacao;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(nullable = false, columnDefinition = "text")
    private String descricao;

    @Column(nullable = false, columnDefinition = "text")
    private String evidencia;

    @Column(name = "fonte_legal", nullable = false, length = 2000)
    private String fonteLegal;

    protected Achado() {
    }

    public Achado(AnaliseConformidade analise, Regra regra, Mercado mercado, ResultadoRegra resultado) {
        this.analise = analise;
        this.regra = regra;
        this.mercado = mercado;
        this.severidade = regra.getSeveridade();
        this.classificacao = resultado.classificacao();
        this.titulo = regra.getTitulo();
        this.descricao = resultado.explicacao();
        this.evidencia = resultado.evidencia();
        this.fonteLegal = regra.getFonteLegal();
    }

    public UUID getId() { return id; }
    public AnaliseConformidade getAnalise() { return analise; }
    public Regra getRegra() { return regra; }
    public Mercado getMercado() { return mercado; }
    public Severidade getSeveridade() { return severidade; }
    public Classificacao getClassificacao() { return classificacao; }
    public String getTitulo() { return titulo; }
    public String getDescricao() { return descricao; }
    public String getEvidencia() { return evidencia; }
    public String getFonteLegal() { return fonteLegal; }
}
