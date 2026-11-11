import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alerta, Conteudo, Campo, Cabecalho } from '../componentes/Elementos.jsx'
import { useAvisos } from '../componentes/avisos.js'
import { useDados, useTitulo } from '../hooks.js'
import { mercados, regras } from '../dados.js'
import { TODAS_CATEGORIAS, CATEGORIAS, TIPOS_REGRA, SEVERIDADES } from '../config.js'
import { separarTermos, dataAtual } from '../utils.js'

const REGRA_VAZIA = {
  title: '',
  description: '',
  type: 'INFORMATION_PRESENCE',
  terms: [],
  marketIds: [],
  category: TODAS_CATEGORIAS,
  severity: 'CRITICAL',
  startDate: dataAtual(),
  endDate: '',
  source: '',
}

export function CadastroRegra() {
  const { id } = useParams()
  const editando = Boolean(id)
  useTitulo(editando ? 'Editar regra' : 'Nova regra')

  const { dados, carregando, erro } = useDados(async () => {
    const [listaMercados, regra] = await Promise.all([
      mercados.listar(),
      editando ? regras.buscar(id) : REGRA_VAZIA,
    ])
    return { mercados: listaMercados, regra }
  }, [id])

  return (
    <div className="pagina">
      <Cabecalho
        sobretitulo="Regras"
        titulo={editando ? 'Editar regra' : 'Nova regra'}
        descricao="Toda regra precisa de uma fonte identificada para que o resultado seja rastreável."
      />
      <Conteudo carregando={carregando} erro={erro}>
        {dados && (
          <FormularioRegra key={id ?? 'new'} mercados={dados.mercados} regraInicial={dados.regra} regraId={id} />
        )}
      </Conteudo>
    </div>
  )
}

function FormularioRegra({ mercados: listaMercados, regraInicial, regraId }) {
  const navegar = useNavigate()
  const { avisar } = useAvisos()
  const [valores, setValores] = useState({ ...regraInicial, terms: regraInicial.terms.join(', ') })
  const [erroFormulario, setErroFormulario] = useState('')
  const [salvando, setSalvando] = useState(false)

  function alterarCampo(evento) {
    setValores((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  function alternarMercado(mercadoId) {
    setValores((atual) => ({
      ...atual,
      marketIds: atual.marketIds.includes(mercadoId)
        ? atual.marketIds.filter((item) => item !== mercadoId)
        : [...atual.marketIds, mercadoId],
    }))
  }

  async function salvarFormulario(evento) {
    evento.preventDefault()
    setErroFormulario('')
    setSalvando(true)
    const dadosFormulario = { ...valores, terms: separarTermos(valores.terms) }
    try {
      if (regraId) await regras.atualizar(regraId, dadosFormulario)
      else await regras.criar(dadosFormulario)
      avisar(regraId ? 'Regra atualizada.' : 'Regra cadastrada.')
      navegar('/rules')
    } catch (erro) {
      setErroFormulario(erro.message)
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={salvarFormulario} noValidate>
      {erroFormulario && <Alerta tom="error">{erroFormulario}</Alerta>}

      <div className="grade-formulario">
        <Campo id="title" rotulo="Título" className="grade-formulario__inteiro">
          <input
            id="title"
            name="title"
            className="input"
            value={valores.title}
            onChange={alterarCampo}
            required
          />
        </Campo>

        <Campo id="description" rotulo="Descrição" className="grade-formulario__inteiro">
          <textarea
            id="description"
            name="description"
            className="textarea"
            rows={3}
            value={valores.description}
            onChange={alterarCampo}
            required
          />
        </Campo>

        <Campo id="type" rotulo="Tipo" dica={TIPOS_REGRA[valores.type]?.hint}>
          <select id="type" name="type" className="select" value={valores.type} onChange={alterarCampo}>
            {Object.entries(TIPOS_REGRA).map(([chave, tipo]) => (
              <option key={chave} value={chave}>
                {tipo.label}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="severity" rotulo="Severidade" dica="Usada quando a regra não é atendida.">
          <select
            id="severity"
            name="severity"
            className="select"
            value={valores.severity}
            onChange={alterarCampo}
          >
            {Object.entries(SEVERIDADES).map(([chave, rotulo]) => (
              <option key={chave} value={chave}>
                {rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="category" rotulo="Categoria de produto">
          <select
            id="category"
            name="category"
            className="select"
            value={valores.category}
            onChange={alterarCampo}
          >
            <option value={TODAS_CATEGORIAS}>Todas as categorias</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="source" rotulo="Fonte" dica="Norma, artigo ou documento de origem.">
          <input
            id="source"
            name="source"
            className="input"
            value={valores.source}
            onChange={alterarCampo}
            required
          />
        </Campo>

        <Campo
          id="terms"
          rotulo="Termos de verificação"
          dica="Separe por vírgula ou quebra de linha. A busca ignora maiúsculas e acentos."
          className="grade-formulario__inteiro"
        >
          <textarea
            id="terms"
            name="terms"
            className="textarea textarea--mono"
            rows={3}
            value={valores.terms}
            onChange={alterarCampo}
            required
          />
        </Campo>

        <fieldset className="campos grade-formulario__inteiro">
          <legend className="campos__legenda">Mercados aplicáveis</legend>
          <div className="opcoes">
            {listaMercados.map((mercado) => (
              <label key={mercado.id} className="opcao">
                <input
                  type="checkbox"
                  className="apenas-leitor"
                  checked={valores.marketIds.includes(mercado.id)}
                  onChange={() => alternarMercado(mercado.id)}
                />
                {mercado.name}
                <code>{mercado.code}</code>
              </label>
            ))}
          </div>
        </fieldset>

        <Campo id="startDate" rotulo="Início da vigência">
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="input"
            value={valores.startDate}
            onChange={alterarCampo}
            required
          />
        </Campo>

        <Campo id="endDate" rotulo="Fim da vigência" dica="Opcional. Deixe vazio se não há prazo final.">
          <input
            id="endDate"
            name="endDate"
            type="date"
            className="input"
            value={valores.endDate}
            onChange={alterarCampo}
          />
        </Campo>
      </div>

      <div className="acoes-formulario">
        <button type="submit" className="botao" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar regra'}
        </button>
        <Link to="/rules" className="acao">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
