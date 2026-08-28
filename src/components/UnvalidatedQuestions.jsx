import QuestionMedia from './QuestionMedia.jsx'
import PageBackButton from './PageBackButton.jsx'
import { selectUnvalidatedQuestions } from '../utils/questionFilters.js'

export default function UnvalidatedQuestions({
  questions,
  validatedIds,
  quizCount = 0,
  onStart,
  onBack,
}) {
  const items = selectUnvalidatedQuestions(questions, validatedIds)

  return (
    <div className="screen collection-screen">
      <PageBackButton onBack={onBack} />

      <div className="collection-heading">
        <h1 className="app-title">Questions jamais validées</h1>
        <p className="app-subtitle">
          {items.length} question{items.length > 1 ? 's' : ''} à valider au moins une fois
        </p>
      </div>

      {items.length > 0 && (
        <div className="card unvalidated-start-card">
          <div>
            <strong>Travailler les questions jamais validées</strong>
            <p>Le nombre de questions, le mode et le chrono utilisent tes Paramètres.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={quizCount === 0}
            onClick={onStart}
          >
            {quizCount > 0 ? `Commencer le quiz (${quizCount})` : 'Aucune question disponible'}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card collection-empty collection-success-empty">
          <strong>Toutes les questions ont été validées</strong>
          <p>Chaque question a déjà été répondue et validée au moins une fois.</p>
        </div>
      ) : (
        <div className="review-list">
          {items.map((question, index) => (
            <article key={question.id} className="card collection-item">
              <div className="collection-item-meta">
                <span className="badge">{question.category}</span>
                {question.law && <span className="badge badge-law">{question.law}</span>}
              </div>
              <p className="review-number">Question {index + 1}</p>
              <p className="review-question">{question.question}</p>
              <QuestionMedia question={question} compact />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
