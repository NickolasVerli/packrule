export function Alert({ tone = 'info', children }) {
  return (
    <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'note'}>
      {children}
    </div>
  )
}
