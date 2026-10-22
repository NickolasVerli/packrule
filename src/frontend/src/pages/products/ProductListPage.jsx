import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncContent } from '../../components/AsyncContent'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { packagingService } from '../../services/packagingService'
import { productService } from '../../services/productService'
import { CATEGORIES } from '../../utils/constants'
import { pluralize } from '../../utils/format'

export function ProductListPage() {
  useDocumentTitle('Produtos')
  const { notify } = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [productToDelete, setProductToDelete] = useState(null)

  const { data, loading, error, reload } = useAsync(async () => {
    const [products, versions] = await Promise.all([
      productService.list(),
      packagingService.listAll(),
    ])
    return { products, versions }
  })

  const filtered = useMemo(() => {
    if (!data) return []
    const term = search.trim().toLowerCase()
    return data.products.filter(
      (product) =>
        (!category || product.category === category) &&
        (!term || product.name.toLowerCase().includes(term)),
    )
  }, [data, search, category])

  async function handleDelete() {
    try {
      await productService.remove(productToDelete.id)
      notify('Produto excluído.')
      reload()
    } catch (err) {
      notify(err.message, 'error')
    }
    setProductToDelete(null)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Cadastro"
        title="Produtos"
        description="Cada produto reúne suas versões de embalagem e o histórico de análises."
        actions={
          <Link to="/products/new" className="btn btn--accent">
            <Icon name="plus" /> Novo produto
          </Link>
        }
      />

      <AsyncContent loading={loading} error={error}>
        {data && (
          <>
            <div className="row">
              <div className="field" style={{ flex: '1 1 260px' }}>
                <label className="visually-hidden" htmlFor="product-search">
                  Buscar produto
                </label>
                <input
                  id="product-search"
                  className="input"
                  type="search"
                  placeholder="Buscar por nome"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="field" style={{ flex: '0 1 220px' }}>
                <label className="visually-hidden" htmlFor="product-category">
                  Filtrar por categoria
                </label>
                <select
                  id="product-category"
                  className="select"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card">
              {filtered.length === 0 ? (
                <EmptyState
                  title={data.products.length === 0 ? 'Nenhum produto cadastrado' : 'Nada encontrado'}
                  description={
                    data.products.length === 0
                      ? 'Cadastre o primeiro produto para enviar uma embalagem e executar análises.'
                      : 'Ajuste a busca ou o filtro de categoria.'
                  }
                  action={
                    data.products.length === 0 && (
                      <Link to="/products/new" className="btn">
                        Cadastrar produto
                      </Link>
                    )
                  }
                />
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Embalagens</th>
                        <th>
                          <span className="visually-hidden">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((product) => {
                        const count = data.versions.filter((v) => v.productId === product.id).length
                        return (
                          <tr key={product.id}>
                            <td>
                              <Link to={`/products/${product.id}`} className="table__title">
                                {product.name}
                              </Link>
                            </td>
                            <td>
                              <span className="tag">{product.category}</span>
                            </td>
                            <td className="muted">{pluralize(count, 'versão', 'versões')}</td>
                            <td>
                              <div className="table__actions">
                                <Link
                                  to={`/products/${product.id}/edit`}
                                  className="btn btn--ghost btn--small"
                                >
                                  Editar
                                </Link>
                                <button
                                  type="button"
                                  className="btn btn--danger btn--small"
                                  onClick={() => setProductToDelete(product)}
                                >
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </AsyncContent>

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Excluir produto?"
        message={`“${productToDelete?.name ?? ''}” será excluído junto com todas as suas versões de embalagem e análises. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir produto"
        onConfirm={handleDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  )
}
