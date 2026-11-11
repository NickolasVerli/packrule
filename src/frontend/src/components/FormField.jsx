export function FormField({ id, label, hint, error, className = '', children }) {
  return (
    <div className={`field ${className}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}
