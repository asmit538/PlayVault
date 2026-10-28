import { useEffect, useRef } from 'react'
import { Icon } from './Icons'
import './Modal.css'

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = '600px' }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="pv-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="pv-modal-container"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="pv-modal-header">
          <div>
            <h2 className="pv-modal-title">{title}</h2>
            {subtitle && <p className="pv-modal-subtitle">{subtitle}</p>}
          </div>
          <button className="pv-modal-close" onClick={onClose} aria-label="Close modal">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="pv-modal-body">{children}</div>
      </div>
    </div>
  )
}
