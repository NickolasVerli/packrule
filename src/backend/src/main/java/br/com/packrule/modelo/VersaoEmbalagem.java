package br.com.packrule.modelo;

import br.com.packrule.dto.DadosEmbalagem;
import br.com.packrule.servicos.ArquivoValidado;
import br.com.packrule.servicos.ExtracaoTexto;
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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "versao_embalagem")
public class VersaoEmbalagem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(name = "numero_versao", nullable = false)
    private int numeroVersao;

    @Column(name = "nome_arquivo", nullable = false)
    private String nomeArquivo;

    @Column(name = "tipo_arquivo", nullable = false, length = 80)
    private String tipoArquivo;

    @Column(name = "tamanho_arquivo", nullable = false)
    private long tamanhoArquivo;

    @Column(nullable = false, length = 200)
    private String material;

    @Column(name = "quantidade_declarada", nullable = false, length = 100)
    private String quantidadeDeclarada;

    @Column(name = "texto_extraido", nullable = false, columnDefinition = "text")
    private String textoExtraido;

    @Column(name = "data_lancamento")
    private LocalDate dataLancamento;

    @Column(name = "data_envio", nullable = false)
    private Instant dataEnvio;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_extracao", nullable = false, length = 30)
    private StatusExtracao statusExtracao;

    @Column(name = "mensagem_extracao", nullable = false, length = 500)
    private String mensagemExtracao;

    @OneToMany(mappedBy = "versaoEmbalagem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnaliseConformidade> analises = new ArrayList<>();

    protected VersaoEmbalagem() {
    }

    public VersaoEmbalagem(Produto produto, int numero, ArquivoValidado arquivo, DadosEmbalagem dados, ExtracaoTexto extracao) {
        this.produto = produto;
        this.numeroVersao = numero;
        this.nomeArquivo = arquivo.nome();
        this.tipoArquivo = arquivo.tipo();
        this.tamanhoArquivo = arquivo.conteudo().length;
        this.material = dados.material() == null ? "" : dados.material().strip();
        this.quantidadeDeclarada = dados.quantidadeDeclarada() == null ? "" : dados.quantidadeDeclarada().strip();
        this.textoExtraido = extracao.texto();
        this.statusExtracao = extracao.status();
        this.mensagemExtracao = extracao.mensagem();
        this.dataLancamento = dados.dataLancamento();
        this.dataEnvio = Instant.now();
    }

    public void atualizarTextoExtraido(String texto) {
        this.textoExtraido = texto.strip();
        this.statusExtracao = texto.isBlank() ? StatusExtracao.REVISAO_NECESSARIA : StatusExtracao.REVISADO;
        this.mensagemExtracao = texto.isBlank() ? "Informe o texto antes da análise automática." : "Texto revisado pelo usuário.";
    }

    public UUID getId() { return id; }
    public Produto getProduto() { return produto; }
    public int getNumeroVersao() { return numeroVersao; }
    public String getNomeArquivo() { return nomeArquivo; }
    public String getTipoArquivo() { return tipoArquivo; }
    public long getTamanhoArquivo() { return tamanhoArquivo; }
    public String getMaterial() { return material; }
    public String getQuantidadeDeclarada() { return quantidadeDeclarada; }
    public String getTextoExtraido() { return textoExtraido; }
    public LocalDate getDataLancamento() { return dataLancamento; }
    public Instant getDataEnvio() { return dataEnvio; }
    public StatusExtracao getStatusExtracao() { return statusExtracao; }
    public String getMensagemExtracao() { return mensagemExtracao; }
}
