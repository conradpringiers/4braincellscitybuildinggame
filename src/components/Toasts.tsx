import { useEffect } from 'react'
import { useGame } from '../state/GameContext'
import type { Toast } from '../state/types'
import './Toasts.css'

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4600)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  return (
    <div className={`toast toast--${toast.tone}`} role="status">
      <span className="toast__icon">{toast.icon}</span>
      <div className="toast__body">
        <strong className="toast__title">{toast.title}</strong>
        {toast.body && <span className="toast__text">{toast.body}</span>}
      </div>
      <button className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}

export default function Toasts() {
  const { state, dismissToast } = useGame()
  return (
    <div className="toasts" aria-live="polite">
      {state.toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
