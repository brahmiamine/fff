import { useEffect } from 'react'

export default function PageBackButton({ onBack }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  return (
    <div className="quiz-header">
      <div className="quiz-header-actions">
        <button type="button" className="btn-link" onClick={onBack}>← Retour</button>
      </div>
    </div>
  )
}
