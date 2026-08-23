import { useState } from 'react'
import { isAnswerCorrect } from './QuestionCard.jsx'
import { computeScore } from '../utils/scoring.js'

const BASE = import.meta.env.BASE_URL

export default function Results({ questions, answers, passThreshold, onRestart }) {
  const [showReview, setShowReview] = useState(false)

  const scored = questions.map((q) => ({
    question: q,
    selected: answers[q.id] || [],
    correct: isAnswerCorrect(q, answers[q.id] || []),
  }))
  const goodCount = scored.filter((s) => s.correct).length
  const total = questions.length

  const score = computeScore(questions, answers)
  const passed = score.total / 100 >= passThreshold

  function optionLabel(question, optionId) {
    const opt = question.options.find((o) => o.id === optionId)
    return opt ? opt.text : ''
  }

  return (
    <div className="screen results-screen">
      <div className={`card score-card ${passed ? 'score-pass' : 'score-fail'}`}>
        <p className="score-headline">{passed ? 'Réussi' : 'À retravailler'}</p>
        <p className="score-number">{score.total} / 100</p>
        <p className="score-percent">
          {goodCount} / {total} questions entièrement correctes
          {score.unanswered > 0 && ` · ${score.unanswered} non répondue${score.unanswered > 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="results-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setShowReview((v) => !v)}>
          {showReview ? 'Masquer la correction' : 'Voir la correction détaillée'}
        </button>
        <button type="button" className="btn btn-primary" onClick={onRestart}>
          Nouveau quiz
        </button>
      </div>

      {showReview && (
        <div className="review-list">
          {scored.map(({ question, selected, correct }, i) => (
            <div key={question.id} className={`card review-item ${correct ? 'review-ok' : 'review-ko'}`}>
              <p className="review-number">
                Question {i + 1} — {question.category}
              </p>
              <p className="review-question">{question.question}</p>

              {question.image && (
                <img src={`${BASE}${question.image}`} alt="" className="review-image" />
              )}

              <p className="review-line">
                <span className="review-tag">Votre réponse : </span>
                {selected.length > 0
                  ? selected.map((id) => optionLabel(question, id)).join(', ')
                  : 'Aucune réponse'}
              </p>
              {!correct && (
                <p className="review-line">
                  <span className="review-tag">Bonne réponse : </span>
                  {question.correct.map((id) => optionLabel(question, id)).join(', ')}
                </p>
              )}
              {question.explanation && <p className="review-explanation">{question.explanation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
