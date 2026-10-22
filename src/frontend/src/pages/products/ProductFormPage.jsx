import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { AsyncContent } from '../../components/AsyncContent'
import { FormField } from '../../components/FormField'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { productService } from '../../services/productService'
import { CATEGORIES } from '../../utils/constants'

const EMPTY_PRODUCT = { name: '', category: '', description: '' }

export function ProductFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  useDocumentTitle(isEditing ? 'Editar produto' : 'Novo produto')

  const { data, loading, error } = useAsync(
    async () => (isEditing ? productService.get(id) : EMPTY_PRODUCT),
    [id],
  )

  return (
    <div className="page">
      <PageHeader
        eyebrow="Produtos"
        title={isEditing ? 'Editar produto' : 'Novo produto'}
        description="Nome, categoria e descrição definem quais regras serão aplicadas nas análises."
      />
      <AsyncContent loading={loading} error={error}>
        {data && <ProductForm key={id ?? 'new'} initialValues={data} productId={id} />}
      </AsyncContent>
    </div>
  )
}

function ProductForm({ initialValues, productId }) {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [values, setValues] = useState({
    name: initialValues.name,
    category: initialValues.category,
    description: initialValues.description,
  })
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    setSaving(true)
    try {
      const saved = productId
        ? await productService.update(productId, values)
        : await productService.create(values)
      notify(productId ? 'Produto atualizado.' : 'Produto cadastrado.')
      navigate(`/products/${saved.id}`)
    } catch (err) {
      setSubmitError(err.message)
      setSaving(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="card__body stack">
        {submitError && <Alert tone="error">{submitError}</Alert>}

        <div className="form-grid">
          <FormField id="name" label="Nome do produto" className="form-grid__full">
            <input
              id="name"
              name="name"
              className="input"
              value={values.name}
              onChange={handleChange}
              placeholder="Ex.: Shampoo Hidratação Profunda 300 ml"
              required
            />
          </FormField>

          <FormField id="category" label="Categoria">
            <select
              id="category"
              name="category"
              className="select"
              value={values.category}
              onChange={handleChange}
              required
            >
              <option value="">Selecione…</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="description"
            label="Descrição"
            hint="Opcional. Contexto sobre o produto e o mercado pretendido."
            className="form-grid__full"
          >
            <textarea
              id="description"
              name="description"
              className="textarea"
              value={values.description}
              onChange={handleChange}
            />
          </FormField>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--accent" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar produto'}
          </button>
          <Link to={productId ? `/products/${productId}` : '/products'} className="btn btn--ghost">
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  )
}
