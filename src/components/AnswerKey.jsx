import { useMemo, useState } from 'react'
import QuestionMedia from './QuestionMedia.jsx'
import PageBackButton from './PageBackButton.jsx'
import {
  DEFAULT_QUESTION_FILTERS,
  filterQuestionList,
  getQuestionFilterOptions,
} from '../utils/questionFilters.js'

function formatValue(value) {
  if (!value) return ''
  return value.charAt(0).toLocaleUpperCase('fr-FR') + value.slice(1)
}

export default function AnswerKey({ questions, validatedIds = [], onBack, showExplanations = true }) {
  const [filters, setFilters] = useState(DEFAULT_QUESTION_FILTERS)
  const options = useMemo(() => getQuestionFilterOptions(questions), [questions])
  const filteredQuestions = useMemo(
    () => filterQuestionList(questions, filters, validatedIds),
    [questions, filters, validatedIds],
  )
  const validated = useMemo(() => new Set(validatedIds), [validatedIds])
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => (
    key === 'query' ? value.trim().length > 0 : value !== 'all'
  ))

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function resetFilters() {
    setFilters(DEFAULT_QUESTION_FILTERS)
  }

  return (
    <div className="screen answerkey-screen">
      <PageBackButton onBack={onBack} />

      <h1 className="app-title">Toutes les questions et réponses</h1>
      <p className="app-subtitle">
        {filteredQuestions.length} sur {questions.length} question{questions.length > 1 ? 's' : ''}
      </p>

      <div className="card question-browser-filters">
        <label className="question-search-field">
          <span>Rechercher</span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => updateFilter('query', event.target.value)}
            placeholder="Question, réponse, mot-clé…"
            autoComplete="off"
          />
        </label>

        <div className="question-filter-grid">
          <label>
            <span>Loi</span>
            <select value={filters.law} onChange={(event) => updateFilter('law', event.target.value)}>
              <option value="all">Toutes les lois</option>
              {options.laws.map((law) => <option key={law} value={law}>{law}</option>)}
            </select>
          </label>

          <label>
            <span>Difficulté</span>
            <select value={filters.difficulty} onChange={(event) => updateFilter('difficulty', event.target.value)}>
              <option value="all">Toutes</option>
              {options.difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>{formatValue(difficulty)}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Catégorie</span>
            <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
              <option value="all">Toutes</option>
              {options.categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>

          <label>
            <span>Média</span>
            <select value={filters.media} onChange={(event) => updateFilter('media', event.target.value)}>
              <option value="all">Tous</option>
              <option value="image">Avec image</option>
              <option value="video">Avec vidéo</option>
            </select>
          </label>

          <label>
            <span>Validation</span>
            <select value={filters.validation} onChange={(event) => updateFilter('validation', event.target.value)}>
              <option value="all">Toutes</option>
              <option value="validated">Validées</option>
              <option value="unvalidated">Jamais validées</option>
            </select>
          </label>
        </div>

        {hasActiveFilters && (
          <button type="button" className="question-filters-reset" onClick={resetFilters}>
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="card question-browser-empty">
          <strong>Aucune question trouvée</strong>
          <p>Modifie la recherche ou enlève un filtre pour élargir les résultats.</p>
          {hasActiveFilters && (
            <button type="button" className="btn btn-secondary" onClick={resetFilters}>Afficher toutes les questions</button>
          )}
        </div>
      ) : (
        <div className="review-list">
          {filteredQuestions.map((q, i) => (
            <div key={q.id} className="card review-item review-ok">
              <div className="question-browser-meta">
                <p className="review-number">
                  Question {i + 1} — {q.category}
                </p>
                <span className={`question-validation-status ${validated.has(q.id) ? 'is-validated' : ''}`}>
                  {validated.has(q.id) ? '✓ Validée' : 'Jamais validée'}
                </span>
              </div>
              <p className="review-question">{q.question}</p>

              <QuestionMedia question={q} compact />

              <ul className="answerkey-options">
                {q.options.map((opt) => {
                  const isCorrect = q.correct.includes(opt.id)
                  return (
                    <li
                      key={opt.id}
                      className={`answerkey-option ${isCorrect ? 'answerkey-option-correct' : ''}`}
                    >
                      {isCorrect ? '✓ ' : ''}
                      {opt.text}
                    </li>
                  )
                })}
              </ul>

              {showExplanations && q.explanation && <p className="review-explanation">{q.explanation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
