import { useEffect } from 'react'
import { FOOTBALL_ABBREVIATIONS } from '../data/abbreviations.js'

export default function AbbreviationsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="abbreviations-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="abbreviations-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="abbreviations-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="abbreviations-modal-header">
          <div>
            <p className="abbreviations-eyebrow">Aide-mémoire arbitre</p>
            <h3 id="abbreviations-title">Abréviations</h3>
          </div>
          <button type="button" className="abbreviations-close" onClick={onClose} aria-label="Fermer les abréviations">×</button>
        </div>

        <div className="abbreviations-list">
          {FOOTBALL_ABBREVIATIONS.map(({ code, label }) => (
            <div className="abbreviations-row" key={code}>
              <strong className="abbreviations-code">{code}</strong>
              <span className="abbreviations-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
