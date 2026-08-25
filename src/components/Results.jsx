import { useMemo, useState } from 'react'
import { isAnswerCorrect } from '../utils/answers.js'
import { computeScore } from '../utils/scoring.js'
import QuestionMedia from './QuestionMedia.jsx'

export default function Results({ questions, answers, passThreshold, mode, onRestart, onReviewMistakes, showExplanations = true }) {
  const [showReview, setShowReview] = useState(mode === 'exam')

  const scored = questions.map((q) => ({ question: q, selected: answers[q.id] || [], correct: isAnswerCorrect(q, answers[q.id] || []) }))
  const goodCount = scored.filter((item) => item.correct).length
  const total = questions.length
  const mistakeCount = total - goodCount
  const score = computeScore(questions, answers)
  const passed = score.total / 100 >= passThreshold

  const categories = useMemo(() => {
    const map = new Map()
    scored.forEach(({ question, correct }) => {
      if (!map.has(question.category)) map.set(question.category, { category: question.category, correct: 0, total: 0 })
      const item = map.get(question.category)
      item.total += 1
      if (correct) item.correct += 1
    })
    return [...map.values()].map((item) => ({ ...item, rate: item.total ? item.correct / item.total : 0 })).sort((a, b) => a.rate - b.rate)
  }, [scored])

  function optionLabel(question, optionId) {
    return question.options.find((option) => option.id === optionId)?.text || ''
  }

  return (
    <div className="screen results-screen">
      <div className={`card score-card ${passed ? 'score-pass' : 'score-fail'}`}>
        <p className="score-headline">{passed ? 'Réussi' : 'À retravailler'}</p>
        <p className="score-number">{score.total} / 100</p>
        <p className="score-percent">{goodCount} / {total} questions entièrement correctes{score.unanswered > 0 && ` · ${score.unanswered} non répondue${score.unanswered > 1 ? 's' : ''}`}</p>
      </div>

      <div className="card category-results">
        <p className="field-label">Résultats par catégorie</p>
        {categories.map((item) => (
          <div className="metric-row" key={item.category}>
            <div className="metric-label"><span>{item.category}</span><strong>{Math.round(item.rate * 100)}%</strong></div>
            <div className="metric-track"><span style={{ width: `${Math.round(item.rate * 100)}%` }} /></div>
          </div>
        ))}
      </div>

      <div className="results-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setShowReview((value) => !value)}>{showReview ? 'Masquer la correction' : 'Voir la correction détaillée'}</button>
        <button type="button" className="btn btn-primary" onClick={onRestart}>Nouveau quiz</button>
      </div>

      {mistakeCount > 0 && <button type="button" className="btn btn-secondary btn-review-mistakes" onClick={onReviewMistakes}>Réviser mes {mistakeCount} erreur{mistakeCount > 1 ? 's' : ''}</button>}

      {showReview && (
        <div className="review-list">
          {scored.map(({ question, selected, correct }, index) => (
            <div key={question.id} className={`card review-item ${correct ? 'review-ok' : 'review-ko'}`}>
              <p className="review-number">Question {index + 1} — {question.category}{question.law ? ` · ${question.law}` : ''}</p>
              <p className="review-question">{question.question}</p>
              <QuestionMedia question={question} compact />
              <p className="review-line"><span className="review-tag">Votre réponse : </span>{selected.length > 0 ? selected.map((id) => optionLabel(question, id)).join(', ') : 'Aucune réponse'}</p>
              {!correct && <p className="review-line"><span className="review-tag">Bonne réponse : </span>{question.correct.map((id) => optionLabel(question, id)).join(', ')}</p>}
              {showExplanations && question.explanation && <p className="review-explanation">{question.explanation}</p>}
              <div className="reference-note">📚 {question.source} · {question.season}{question.takeaway && <><br />💡 {question.takeaway}</>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
