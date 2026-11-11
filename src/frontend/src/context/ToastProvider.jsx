import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from './toastContext'

const TOAST_DURATION = 4000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const notify = useCallback((message, tone = 'success') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, tone }])
    setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      TOAST_DURATION,
    )
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
