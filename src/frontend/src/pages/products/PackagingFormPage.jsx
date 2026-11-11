import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { AsyncContent } from '../../components/AsyncContent'
import { FormField } from '../../components/FormField'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { useToast } from '../../context/toastContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { packagingService } from '../../services/packagingService'
import { productService } from '../../services/productService'
import { ACCEPTED_FILE_EXTENSIONS } from '../../utils/constants'
import { formatFileSize } from '../../utils/format'

export function PackagingFormPage() {
  const { productId } = useParams()
  useDocumentTitle('Nova versão da embalagem')

  const { data: product, loading, error } = useAsync(() => productService.get(productId), [productId])

  return (
    <div className="page">
      <PageHeader
        eyebrow={product?.name ?? 'Embalagem'}
        title="Nova versão da embalagem"
        description="As versões anteriores continuam guardadas. O número da versão é gerado automaticamente."
      />
      <AsyncContent loading={loading} error={error}>
        {product && <PackagingForm productId={productId} />}
      </AsyncContent>
    </div>
  )
}

function PackagingForm({ productId }) {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [file, setFile] = useState(null)
  const [values, setValues] = useState({ material: '', declaredQuantity: '', extractedText: '' })
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
      await packagingService.create(productId, { file, ...values })
      notify('Versão da embalagem enviada.')
      navigate(`/products/${productId}`)
    } catch (err) {
      setSubmitError(err.message)
      setSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {submitError && <Alert tone="error">{submitError}</Alert>}

      <FormField id="file" label="Arquivo da embalagem" hint="PDF, PNG ou JPG, até 10 MB.">
        <label className={`file-drop ${file ? 'file-drop--filled' : ''}`} htmlFor="file">
          <Icon name="file" size={26} />
          {file ? (
            <>
              <strong>{file.name}</strong>
              <span className="muted">{formatFileSize(file.size)} · clique para trocar</span>
            </>
          ) : (
            <>
              <strong>Escolher arquivo</strong>
              <span className="muted">Selecione a arte da embalagem</span>
            </>
          )}
          <input
            id="file"
            type="file"
            className="visually-hidden"
            accept={ACCEPTED_FILE_EXTENSIONS}
            onChange={(event) => setFile(event.target.files[0] ?? null)}
          />
        </label>
      </FormField>

      <div className="form-grid">
        <FormField id="material" label="Material" hint="Opcional. Ex.: PET reciclável.">
          <input
            id="material"
            name="material"
            className="input"
            value={values.material}
            onChange={handleChange}
          />
        </FormField>
        <FormField id="declaredQuantity" label="Quantidade declarada" hint="Opcional. Ex.: 300 ml.">
          <input
            id="declaredQuantity"
            name="declaredQuantity"
            className="input"
            value={values.declaredQuantity}
            onChange={handleChange}
          />
        </FormField>
        <FormField
          id="extractedText"
          label="Texto da embalagem"
          hint="Cole ou digite os textos impressos. As regras são verificadas sobre este conteúdo, e você pode revisá-lo antes de cada análise."
          className="form-grid__full"
        >
          <textarea
            id="extractedText"
            name="extractedText"
            className="textarea textarea--mono"
            rows={8}
            value={values.extractedText}
            onChange={handleChange}
          />
        </FormField>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Enviando…' : 'Enviar embalagem'}
        </button>
        <Link to={`/products/${productId}`} className="link-action">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
