import { useState } from 'react'
import fffLogo from '../assets/fff-logo.png'
import district75Logo from '../assets/district75-logo.png'

const COUNT_OPTIONS = [10, 20, 'all']

export default function Home({ categories, totalQuestions, onStart }) {
  const [category, setCategory] = useState('all')
  const [count, setCount] = useState(10)

  return (
    <div className="screen home-screen">
      <div className="logos-row">
        <img src={fffLogo} alt="Logo FFF" className="logo logo-fff" />
        <img src={district75Logo} alt="Logo District 75 Paris" className="logo logo-district" />
      </div>

      <h1 className="app-title">Quiz Arbitrage</h1>
      <p className="app-subtitle">Entraînement au test théorique de la CDA — District de Paris</p>

      <div className="card setup-card">
        <label className="field-label" htmlFor="category-select">
          Catégorie
        </label>
        <select
          id="category-select"
          className="select-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <span className="field-label">Nombre de questions</span>
        <div className="count-options" role="group" aria-label="Nombre de questions">
          {COUNT_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt}
              className={`chip ${count === opt ? 'chip-active' : ''}`}
              onClick={() => setCount(opt)}
            >
              {opt === 'all' ? `Toutes (${totalQuestions})` : opt}
            </button>
          ))}
        </div>

        <button type="button" className="btn btn-primary btn-start" onClick={() => onStart({ category, count })}>
          Commencer le quiz
        </button>
      </div>

      <p className="footer-note">
        {totalQuestions} questions sur les Lois du Jeu — questions statiques, à but d'entraînement.
      </p>
    </div>
  )
}
