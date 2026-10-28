import { useSports } from '../../context/SportsContext'
import { Icon } from './Icons'
import './ToastContainer.css'

export default function ToastContainer() {
  const { toasts, removeToast } = useSports()

  if (!toasts.length) return null

  return (
    <div className="pv-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`pv-toast pv-toast--${toast.type}`}>
          <div className="pv-toast-icon">
            {toast.type === 'success' && <Icon name="check" size={16} color="#2d8a4e" />}
            {toast.type === 'error' && <Icon name="alert" size={16} color="#c0392b" />}
            {toast.type === 'warning' && <Icon name="alert" size={16} color="#e67e22" />}
            {toast.type === 'info' && <Icon name="activity" size={16} color="#2980b9" />}
          </div>
          <div className="pv-toast-content">
            <span className="pv-toast-message">{toast.message}</span>
          </div>
          <button
            className="pv-toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
