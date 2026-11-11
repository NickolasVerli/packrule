import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alerta, Conteudo, Campo, Cabecalho } from '../componentes/Elementos.jsx'
import { Icone } from '../componentes/Icone.jsx'
import { useAvisos } from '../componentes/avisos.js'
import { useDados, useTitulo } from '../hooks.js'
import { embalagens, produtos } from '../dados.js'
import { EXTENSOES_ARQUIVO } from '../config.js'
import { formatarTamanho } from '../utils.js'

export function CadastroEmbalagem() {
  const { productId: produtoId } = useParams()
  useTitulo('Nova versão da embalagem')

  const { dados: produto, carregando, erro } = useDados(() => produtos.buscar(produtoId), [produtoId])

  return (
    <div className="pagina">
      <Cabecalho
        sobretitulo={produto?.name ?? 'Embalagem'}
        titulo="Nova versão da embalagem"
        descricao="As versões anteriores continuam guardadas. O número da versão é gerado automaticamente."
      />
      <Conteudo carregando={carregando} erro={erro}>
        {produto && <FormularioEmbalagem produtoId={produtoId} />}
      </Conteudo>
    </div>
  )
}

function FormularioEmbalagem({ produtoId }) {
  const navegar = useNavigate()
  const { avisar } = useAvisos()
  const [arquivo, setArquivo] = useState(null)
  const [valores, setValores] = useState({ material: '', declaredQuantity: '', extractedText: '' })
  const [erroFormulario, setErroFormulario] = useState('')
  const [salvando, setSalvando] = useState(false)

  function alterarCampo(evento) {
    setValores((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  async function salvarFormulario(evento) {
    evento.preventDefault()
    setErroFormulario('')
    setSalvando(true)
    try {
      await embalagens.criar(produtoId, { file: arquivo, ...valores })
      avisar('Versão da embalagem enviada.')
      navegar(`/products/${produtoId}`)
    } catch (erro) {
      setErroFormulario(erro.message)
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={salvarFormulario} noValidate>
      {erroFormulario && <Alerta tom="error">{erroFormulario}</Alerta>}

      <Campo id="file" rotulo="Arquivo da embalagem" dica="PDF, PNG ou JPG, até 10 MB.">
        <label className={`envio-arquivo ${arquivo ? "envio-arquivo--preenchido" : ''}`} htmlFor="file">
          <Icone nome="file" tamanho={26} />
          {arquivo ? (
            <>
              <strong>{arquivo.name}</strong>
              <span className="suave">{formatarTamanho(arquivo.size)} · clique para trocar</span>
            </>
          ) : (
            <>
              <strong>Escolher arquivo</strong>
              <span className="suave">Selecione a arte da embalagem</span>
            </>
          )}
          <input
            id="file"
            type="file"
            className="apenas-leitor"
            accept={EXTENSOES_ARQUIVO}
            onChange={(evento) => setArquivo(evento.target.files[0] ?? null)}
          />
        </label>
      </Campo>

      <div className="grade-formulario">
        <Campo id="material" rotulo="Material" dica="Opcional. Ex.: PET reciclável.">
          <input
            id="material"
            name="material"
            className="input"
            value={valores.material}
            onChange={alterarCampo}
          />
        </Campo>
        <Campo id="declaredQuantity" rotulo="Quantidade declarada" dica="Opcional. Ex.: 300 ml.">
          <input
            id="declaredQuantity"
            name="declaredQuantity"
            className="input"
            value={valores.declaredQuantity}
            onChange={alterarCampo}
          />
        </Campo>
        <Campo
          id="extractedText"
          rotulo="Texto da embalagem"
          dica="Cole ou digite os textos impressos. As regras são verificadas sobre este conteúdo, e você pode revisá-lo antes de cada análise."
          className="grade-formulario__inteiro"
        >
          <textarea
            id="extractedText"
            name="extractedText"
            className="textarea textarea--mono"
            rows={8}
            value={valores.extractedText}
            onChange={alterarCampo}
          />
        </Campo>
      </div>

      <div className="acoes-formulario">
        <button type="submit" className="botao" disabled={salvando}>
          {salvando ? 'Enviando…' : 'Enviar embalagem'}
        </button>
        <Link to={`/products/${produtoId}`} className="acao">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
