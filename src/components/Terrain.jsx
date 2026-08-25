import { useState } from 'react'

const BASE = import.meta.env.BASE_URL
const MIN_ZOOM = 1
const MAX_ZOOM = 2.5
const ZOOM_STEP = 0.25

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

export default function Terrain() {
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const zoomPercent = Math.round(zoom * 100)

  function changeZoom(delta) {
    setZoom((current) => clampZoom(current + delta))
  }

  function toggleZoom() {
    setZoom((current) => (current === MIN_ZOOM ? 2 : MIN_ZOOM))
  }

  return (
    <div className="screen terrain-screen">
      <div className="terrain-heading">
        <h1 className="app-title">Terrain</h1>
        <p className="app-subtitle">Dimensions et repères essentiels — Loi 1</p>
      </div>

      <div className="card terrain-card">
        <div className="terrain-toolbar" aria-label="Contrôles de zoom">
          <button
            type="button"
            className="terrain-zoom-button"
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Réduire le zoom"
          >
            −
          </button>
          <span className="terrain-zoom-value" aria-live="polite">{zoomPercent}%</span>
          <button
            type="button"
            className="terrain-zoom-button"
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Agrandir le zoom"
          >
            +
          </button>
          <button
            type="button"
            className="terrain-reset-button"
            onClick={() => setZoom(MIN_ZOOM)}
            disabled={zoom === MIN_ZOOM}
          >
            Réinitialiser
          </button>
        </div>

        <div className="terrain-image-stage">
          <img
            src={`${BASE}images/terrain-dimensions.webp`}
            alt="Schéma des dimensions d'un terrain de football avec surface de but, surface de réparation, point de penalty, cercle central et dimensions des buts"
            className="terrain-image"
            style={{ width: `${zoomPercent}%` }}
            onDoubleClick={toggleZoom}
          />
        </div>

        <p className="terrain-hint">
          Utilise − et + pour zoomer, puis fais glisser la zone pour parcourir l’image agrandie. Double-clic pour passer rapidement de 100 % à 200 %.
        </p>
      </div>

      <div className="card terrain-reference-card">
        <h2>Repères à mémoriser</h2>
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
}
