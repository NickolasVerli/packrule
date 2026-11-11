import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Conteudo, Confirmacao, ListaVazia, Cabecalho } from '../componentes/Elementos.jsx'
import { useAvisos } from '../componentes/avisos.js'
import { useDados, useTitulo } from '../hooks.js'
import { embalagens, produtos } from '../dados.js'
import { CATEGORIAS } from '../config.js'
import { pluralizar } from '../utils.js'

export function Produtos() {
  useTitulo('Produtos')
  const { avisar } = useAvisos()
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [produtoExcluir, setProdutoExcluir] = useState(null)

  const { dados, carregando, erro, recarregar } = useDados(async () => {
    const [listaProdutos, listaVersoes] = await Promise.all([
      produtos.listar(),
      embalagens.listarTodas(),
    ])
    return { produtos: listaProdutos, versoes: listaVersoes }
  })

  const termo = busca.trim().toLowerCase()
  const filtrados = dados?.produtos.filter(
      (produto) =>
        (!categoria || produto.category === categoria) &&
        (!termo || produto.name.toLowerCase().includes(termo)),
    ) ?? []

  async function excluir() {
    try {
      await produtos.excluir(produtoExcluir.id)
      avisar('Produto excluído.')
      recarregar()
    } catch (erro) {
      avisar(erro.message, 'error')
    }
    setProdutoExcluir(null)
  }

  return (
    <div className="pagina">
      <Cabecalho
        sobretitulo={dados ? pluralizar(dados.produtos.length, 'produto', 'produtos') : 'Cadastro'}
        titulo="Produtos"
        descricao="Cada produto reúne suas versões de embalagem e o histórico de análises."
        acoes={
          <Link to="/products/new" className="botao">
            Novo produto
          </Link>
        }
      />

      <Conteudo carregando={carregando} erro={erro}>
        {dados && (
          <section className="secao">
            <div className="filtros">
              <div className="campo">
                <label className="apenas-leitor" htmlFor="product-search">
                  Buscar produto
                </label>
                <input
                  id="product-search"
                  className="input"
                  type="search"
                  placeholder="Buscar por nome"
                  value={busca}
                  onChange={(evento) => setBusca(evento.target.value)}
                />
              </div>
              <div className="campo" style={{ flex: '0 1 240px' }}>
                <label className="apenas-leitor" htmlFor="product-category">
                  Filtrar por categoria
                </label>
                <select
                  id="product-category"
                  className="select"
                  value={categoria}
                  onChange={(evento) => setCategoria(evento.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {CATEGORIAS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filtrados.length === 0 ? (
              <ListaVazia
                titulo={dados.produtos.length === 0 ? 'Nenhum produto cadastrado' : 'Nada encontrado'}
                descricao={
                  dados.produtos.length === 0
                    ? 'Cadastre o primeiro produto para enviar uma embalagem e executar análises.'
                    : 'Ajuste a busca ou o filtro de categoria.'
                }
                acao={
                  dados.produtos.length === 0 && (
                    <Link to="/products/new" className="botao botao--pequeno">
                      Cadastrar produto
                    </Link>
                  )
                }
              />
            ) : (
              <ul className="registros">
                {filtrados.map((produto) => {
                  const quantidade = dados.versoes.filter((v) => v.productId === produto.id).length
                  return (
                    <li key={produto.id} className="registro">
                      <Link to={`/products/${produto.id}`} style={{ textDecoration: 'none' }}>
                        <p className="registro__titulo">{produto.name}</p>
                        <p className="registro__detalhes">
                          {produto.category} · {pluralizar(quantidade, 'versão', 'versões')}
                        </p>
                      </Link>
                      <div className="registro__lateral">
                        <Link to={`/products/${produto.id}/edit`} className="acao">
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="acao acao--perigo"
                          onClick={() => setProdutoExcluir(produto)}
                        >
                          Excluir
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}
      </Conteudo>

      <Confirmacao
        aberto={Boolean(produtoExcluir)}
        titulo="Excluir produto?"
        mensagem={`“${produtoExcluir?.name ?? ''}” será excluído junto com todas as suas versões de embalagem e análises. Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir produto"
        aoConfirmar={excluir}
        aoCancelar={() => setProdutoExcluir(null)}
      />
    </div>
  )
}
