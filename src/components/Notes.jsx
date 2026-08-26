import NOTES from '../data/notes.js'

export default function Notes({ onBack }) {
  return (
    <div className="screen collection-screen notes-screen">
      <div className="quiz-header">
        <button type="button" className="btn-link" onClick={onBack}>← Paramètres</button>
      </div>

      <div className="collection-heading">
        <h1 className="app-title">Mes notes</h1>
        <p className="app-subtitle">Définitions et rappels utiles pour l’arbitrage</p>
      </div>

      <div className="review-list">
        {NOTES.map((note, index) => (
          <article key={note.id} className="card collection-item">
            <div className="collection-item-meta">
              <span className="badge badge-law">{note.law}</span>
              <span className="badge">Définition</span>
            </div>

            <p className="review-number">Note {index + 1}</p>
            <h2 className="review-question">{note.title}</h2>

            {note.paragraphs.map((paragraph) => (
              <p key={paragraph} className="review-explanation">{paragraph}</p>
            ))}

            <p className="collection-note">Référence : {note.law} — {note.reference}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
