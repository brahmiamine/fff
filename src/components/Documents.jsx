import { useEffect, useMemo, useState } from 'react'
import DOCUMENTS from '../data/documents.json'

const SELECTED_DOCUMENT_KEY = 'cda-paris-quiz:selected-document'

function loadSelectedDocumentId() {
  try {
    return window.sessionStorage.getItem(SELECTED_DOCUMENT_KEY)
  } catch {
    return null
  }
}

function buildViewerUrl(documentUrl) {
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(documentUrl)}`
}

export default function Documents() {
  const [selectedId, setSelectedId] = useState(loadSelectedDocumentId)
  const [viewerLoading, setViewerLoading] = useState(false)
  const selectedDocument = DOCUMENTS.find((document) => document.id === selectedId) || null
  const viewerUrl = useMemo(
    () => selectedDocument ? buildViewerUrl(selectedDocument.url) : null,
    [selectedDocument],
  )

  useEffect(() => {
    try {
      if (selectedId) window.sessionStorage.setItem(SELECTED_DOCUMENT_KEY, selectedId)
      else window.sessionStorage.removeItem(SELECTED_DOCUMENT_KEY)
    } catch {
      // Le stockage peut être indisponible ; le lecteur reste utilisable.
    }
  }, [selectedId])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    setViewerLoading(Boolean(selectedId))
  }, [selectedId])

  if (selectedDocument) {
    return (
      <div className="screen documents-screen document-viewer-screen">
        <div className="document-viewer-header">
          <button
            type="button"
            className="btn-link document-viewer-back"
            onClick={() => setSelectedId(null)}
          >
            ← Mes documents
          </button>

          <div className="document-viewer-heading">
            <span className="document-icon" aria-hidden="true">{selectedDocument.icon || '📄'}</span>
            <span>
              <h1>{selectedDocument.title}</h1>
              <p>{selectedDocument.subtitle}</p>
            </span>
          </div>
        </div>

        <div className="document-pdf-viewer card">
          {viewerLoading && (
            <div className="document-viewer-loading" role="status" aria-live="polite">
              <span className="document-viewer-spinner" aria-hidden="true" />
              <strong>Chargement du document…</strong>
              <small>Le PDF s’affiche directement dans l’application.</small>
            </div>
          )}

          <iframe
            key={selectedDocument.id}
            src={viewerUrl}
            title={`${selectedDocument.title} — PDF`}
            className="document-pdf-frame"
            loading="eager"
            allow="fullscreen"
            onLoad={() => setViewerLoading(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="screen collection-screen documents-screen">
      <div className="collection-heading">
        <h1 className="app-title">Mes documents</h1>
        <p className="app-subtitle">Documents utiles pour l’arbitrage</p>
      </div>

      <div className="documents-list">
        {DOCUMENTS.map((document) => (
          <button
            type="button"
            key={document.id}
            className="card document-card"
            onClick={() => setSelectedId(document.id)}
            aria-label={`Lire ${document.title} dans l’application`}
          >
            <span className="document-icon" aria-hidden="true">{document.icon || '📄'}</span>
            <span className="document-copy">
              <strong>{document.title}</strong>
              <small>{document.subtitle}</small>
              <span className="document-meta">
                <span className="badge badge-law">{document.type || 'Document'}</span>
                {document.source && <span>{document.source}</span>}
              </span>
            </span>
            <span className="document-arrow" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
