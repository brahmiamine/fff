import { useState } from 'react'

const MIN_ZOOM = 1
const MAX_ZOOM = 2
const ZOOM_STEP = 0.25

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function TerrainDiagram() {
  return (
    <svg className="terrain-diagram" viewBox="0 0 900 620" role="img" aria-labelledby="terrain-diagram-title terrain-diagram-desc">
      <title id="terrain-diagram-title">Schéma vectoriel d’un terrain de football</title>
      <desc id="terrain-diagram-desc">Terrain avec ligne médiane, cercle central, surfaces de réparation, surfaces de but et points de penalty.</desc>

      <rect className="terrain-svg-bg" x="0" y="0" width="900" height="620" rx="18" />
      <text className="terrain-svg-dimension" x="450" y="42" textAnchor="middle">Longueur : 90 à 120 m</text>
      <text className="terrain-svg-dimension" x="28" y="300" textAnchor="middle" transform="rotate(-90 28 300)">Largeur : 45 à 90 m</text>

      <g className="terrain-svg-lines">
        <rect x="90" y="70" width="720" height="460" />
        <line x1="450" y1="70" x2="450" y2="530" />
        <circle cx="450" cy="300" r="70" />
        <circle cx="450" cy="300" r="5" className="terrain-svg-dot" />

        <rect x="90" y="180" width="130" height="240" />
        <rect x="90" y="235" width="55" height="130" />
        <circle cx="180" cy="300" r="5" className="terrain-svg-dot" />
        <path d="M220 243 A70 70 0 0 1 220 357" />
        <rect x="76" y="265" width="14" height="70" />

        <rect x="680" y="180" width="130" height="240" />
        <rect x="755" y="235" width="55" height="130" />
        <circle cx="720" cy="300" r="5" className="terrain-svg-dot" />
        <path d="M680 243 A70 70 0 0 0 680 357" />
        <rect x="810" y="265" width="14" height="70" />

        <path d="M90 88 A18 18 0 0 0 108 70" />
        <path d="M792 70 A18 18 0 0 0 810 88" />
        <path d="M90 512 A18 18 0 0 1 108 530" />
        <path d="M792 530 A18 18 0 0 1 810 512" />
      </g>

      <g className="terrain-svg-labels">
        <text x="152" y="166" textAnchor="middle">16,5 m</text>
        <text x="117" y="226" textAnchor="middle">5,5 m</text>
        <text x="180" y="292" textAnchor="middle">11 m</text>
        <text x="748" y="166" textAnchor="middle">16,5 m</text>
        <text x="783" y="226" textAnchor="middle">5,5 m</text>
        <text x="720" y="292" textAnchor="middle">11 m</text>
        <text x="450" y="215" textAnchor="middle">9,15 m</text>
      </g>
    </svg>
  )
}

export default function Terrain({ embedded = false }) {
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const zoomPercent = Math.round(zoom * 100)

  function changeZoom(delta) {
    setZoom((current) => clampZoom(current + delta))
  }

  function toggleZoom() {
    setZoom((current) => (current === MIN_ZOOM ? 2 : MIN_ZOOM))
  }

  const content = (
    <div className={`terrain-card${embedded ? ' terrain-card-embedded' : ''}`}>
      <div className="terrain-toolbar" aria-label="Contrôles de zoom">
        <button type="button" className="terrain-zoom-button" onClick={() => changeZoom(-ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Réduire le zoom">−</button>
        <span className="terrain-zoom-value" aria-live="polite">{zoomPercent}%</span>
        <button type="button" className="terrain-zoom-button" onClick={() => changeZoom(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Agrandir le zoom">+</button>
        <button type="button" className="terrain-reset-button" onClick={() => setZoom(MIN_ZOOM)} disabled={zoom === MIN_ZOOM}>Réinitialiser</button>
      </div>

      <div className="terrain-image-stage" onDoubleClick={toggleZoom}>
        <div className="terrain-diagram-wrap" style={{ width: `${zoomPercent}%` }}>
          <TerrainDiagram />
        </div>
      </div>

      <p className="terrain-hint">Le schéma est vectoriel : il reste net lorsque tu zoomes. Double-clic pour passer rapidement de 100 % à 200 %.</p>

      <div className="terrain-reference-block">
        <h3>Repères à mémoriser</h3>
        <div className="terrain-reference-grid">
          <span><strong>90–120 m</strong> longueur</span>
          <span><strong>45–90 m</strong> largeur</span>
          <span><strong>16,5 m</strong> surface de réparation</span>
          <span><strong>5,5 m</strong> surface de but</span>
          <span><strong>11 m</strong> point de penalty</span>
          <span><strong>9,15 m</strong> rayon / distance</span>
          <span><strong>7,32 m</strong> largeur du but</span>
          <span><strong>2,44 m</strong> hauteur du but</span>
        </div>
      </div>
    </div>
  )

  if (embedded) return content

  return (
    <section className="home-terrain-section" aria-labelledby="terrain-title">
      <div className="home-section-heading">
        <div>
          <h2 id="terrain-title">Terrain — Loi 1</h2>
          <p>Dimensions et repères essentiels</p>
        </div>
        <span className="home-section-chip">Référence</span>
      </div>

      <div className="card">{content}</div>
    </section>
  )
}
