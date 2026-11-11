import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alerta, Conteudo, Campo, Cabecalho } from '../componentes/Elementos.jsx'
import { useAvisos } from '../componentes/avisos.js'
import { useDados, useTitulo } from '../hooks.js'
import { produtos } from '../dados.js'
import { CATEGORIAS } from '../config.js'

const PRODUTO_VAZIO = { name: '', category: '', description: '' }

export function CadastroProduto() {
  const { id } = useParams()
  const editando = Boolean(id)
  useTitulo(editando ? 'Editar produto' : 'Novo produto')

  const { dados, carregando, erro } = useDados(
    async () => (editando ? produtos.buscar(id) : PRODUTO_VAZIO),
    [id],
  )

  return (
    <div className="pagina">
      <Cabecalho
        sobretitulo="Produtos"
        titulo={editando ? 'Editar produto' : 'Novo produto'}
        descricao="Identifique o produto e escolha a categoria que orientará as verificações da embalagem."
      />
      <Conteudo carregando={carregando} erro={erro}>
        {dados && <FormularioProduto key={id ?? 'new'} valoresIniciais={dados} produtoId={id} />}
      </Conteudo>
    </div>
  )
}

function FormularioProduto({ valoresIniciais, produtoId }) {
  const navegar = useNavigate()
  const { avisar } = useAvisos()
  const [valores, setValores] = useState({
    name: valoresIniciais.name,
    category: valoresIniciais.category,
    description: valoresIniciais.description,
  })
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
      const salvo = produtoId
        ? await produtos.atualizar(produtoId, valores)
        : await produtos.criar(valores)
      avisar(produtoId ? 'Produto atualizado.' : 'Produto cadastrado.')
      navegar(`/products/${salvo.id}`)
    } catch (erro) {
      setErroFormulario(erro.message)
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={salvarFormulario} noValidate>
      {erroFormulario && <Alerta tom="error">{erroFormulario}</Alerta>}

      <div className="grade-formulario">
        <Campo id="name" rotulo="Nome do produto" className="grade-formulario__inteiro">
          <input
            id="name"
            name="name"
            className="input"
            value={valores.name}
            onChange={alterarCampo}
            placeholder="Ex.: Shampoo Hidratação Profunda 300 ml"
            required
          />
        </Campo>

        <Campo id="category" rotulo="Categoria" className="grade-formulario__inteiro">
          <select
            id="category"
            name="category"
            className="select"
            value={valores.category}
            onChange={alterarCampo}
            required
          >
            <option value="">Selecione…</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          id="description"
          rotulo="Descrição"
          dica="Opcional. Contexto sobre o produto e o mercado pretendido."
          className="grade-formulario__inteiro"
        >
          <textarea
            id="description"
            name="description"
            className="textarea"
            value={valores.description}
            onChange={alterarCampo}
          />
        </Campo>
      </div>

      <div className="acoes-formulario">
        <button type="submit" className="botao" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar produto'}
        </button>
        <Link to={produtoId ? `/products/${produtoId}` : '/products'} className="acao">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
