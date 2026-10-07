import { useEffect, type ReactNode } from 'react'
import { Icon } from './Icon'
import './Sheet.css'

interface SheetProps {
  eyebrow?: string
  title?: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg' | 'xl'
  /** hides the default header when a view renders its own hero header */
  bare?: boolean
  footer?: ReactNode
}

export default function Sheet({
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
  size = 'lg',
  bare = false,
  footer,
}: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
      <button className="sheet__backdrop" onClick={onClose} aria-label="Close panel" />
      <div className={`sheet__panel sheet__panel--${size}`}>
        {!bare && (
          <header className="sheet__header">
            <div className="sheet__heading">
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
              {title && <h2 className="sheet__title display">{title}</h2>}
              {subtitle && <p className="sheet__sub muted">{subtitle}</p>}
            </div>
            <button className="sheet__close" onClick={onClose} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
          </header>
        )}

        {bare && (
          <button className="sheet__close sheet__close--float" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        )}

        <div className="sheet__body">{children}</div>

        {footer && <footer className="sheet__footer">{footer}</footer>}
      </div>
    </div>
  )
}
