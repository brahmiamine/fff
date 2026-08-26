import DOCUMENTS from '../data/documents.json'
import PageBackButton from './PageBackButton.jsx'

export default function Documents({ onBack }) {
  return (
    <div className="screen collection-screen documents-screen">
      <PageBackButton onBack={onBack} />

      <div className="collection-heading">
        <h1 className="app-title">Mes documents</h1>
        <p className="app-subtitle">Documents utiles pour l’arbitrage</p>
      </div>

      <div className="documents-list">
        {DOCUMENTS.map((document) => (
          <a
            key={document.id}
            className="card document-card"
            href={document.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Ouvrir ${document.title} en PDF`}
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
            <span className="document-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
