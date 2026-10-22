import { useEffect, useRef } from 'react'

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={dialogRef} className="dialog" onCancel={onCancel} aria-labelledby="dialog-title">
      <div className="dialog__body">
        <h2 id="dialog-title">{title}</h2>
        <p className="muted">{message}</p>
      </div>
      <div className="dialog__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="btn btn--accent" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
