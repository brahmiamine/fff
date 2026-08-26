import { useEffect, useRef, useState } from 'react'
import DOCUMENTS from '../data/documents.json'

const SELECTED_DOCUMENT_KEY = 'cda-paris-quiz:selected-document'
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs'
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs'

function loadSelectedDocumentId() {
  try {
    return window.sessionStorage.getItem(SELECTED_DOCUMENT_KEY)
  } catch {
    return null
  }
}

export default function Documents() {
  const [selectedId, setSelectedId] = useState(loadSelectedDocumentId)
  const [pdfDocument, setPdfDocument] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [viewerLoading, setViewerLoading] = useState(false)
  const [viewerError, setViewerError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [viewportVersion, setViewportVersion] = useState(0)
  const canvasRef = useRef(null)
  const pageContainerRef = useRef(null)
  const selectedDocument = DOCUMENTS.find((document) => document.id === selectedId) || null

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
  }, [selectedId])

  useEffect(() => {
    const onResize = () => setViewportVersion((value) => value + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!selectedDocument) {
      setPdfDocument(null)
      setViewerError('')
      setViewerLoading(false)
      return undefined
    }

    let cancelled = false
    let loadingTask
    let loadedDocument

    setViewerLoading(true)
    setViewerError('')
    setPdfDocument(null)
    setPageNumber(1)
    setZoom(1)

    async function loadPdf() {
      try {
        const pdfjs = await import(/* @vite-ignore */ PDFJS_URL)
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL
        loadingTask = pdfjs.getDocument({ url: selectedDocument.url })
        loadedDocument = await loadingTask.promise
        if (cancelled) return
        setPdfDocument(loadedDocument)
      } catch (error) {
        if (cancelled) return
        console.error('Impossible de charger le PDF', error)
        setViewerError('Impossible d’afficher ce document. Vérifie ta connexion puis réessaie.')
        setViewerLoading(false)
      }
    }

    void loadPdf()

    return () => {
      cancelled = true
      loadingTask?.destroy?.()
      loadedDocument?.destroy?.()
    }
  }, [selectedDocument, reloadKey])

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || !pageContainerRef.current) return undefined

    let cancelled = false
    let renderTask

    async function renderPage() {
      try {
        setViewerLoading(true)
        setViewerError('')

        const page = await pdfDocument.getPage(pageNumber)
        if (cancelled) return

        const baseViewport = page.getViewport({ scale: 1 })
        const availableWidth = Math.max(pageContainerRef.current.clientWidth - 20, 240)
        const fitScale = availableWidth / baseViewport.width
        const cssScale = fitScale * zoom
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        const renderViewport = page.getViewport({ scale: cssScale * pixelRatio })
        const cssViewport = page.getViewport({ scale: cssScale })

        const canvas = canvasRef.current
        const context = canvas.getContext('2d', { alpha: false })
        canvas.width = Math.ceil(renderViewport.width)
        canvas.height = Math.ceil(renderViewport.height)
        canvas.style.width = `${Math.ceil(cssViewport.width)}px`
        canvas.style.height = `${Math.ceil(cssViewport.height)}px`

        renderTask = page.render({ canvasContext: context, viewport: renderViewport })
        await renderTask.promise
        if (!cancelled) setViewerLoading(false)
      } catch (error) {
        if (cancelled || error?.name === 'RenderingCancelledException') return
        console.error('Impossible de rendre la page PDF', error)
        setViewerError('La page du document n’a pas pu être affichée.')
        setViewerLoading(false)
      }
    }

    void renderPage()

    return () => {
      cancelled = true
      renderTask?.cancel?.()
    }
  }, [pdfDocument, pageNumber, zoom, viewportVersion])

  function closeDocument() {
    setSelectedId(null)
    setPdfDocument(null)
    setViewerError('')
  }

  if (selectedDocument) {
    const totalPages = pdfDocument?.numPages || 0

    return (
      <div className="screen documents-screen document-viewer-screen">
        <div className="document-viewer-header">
          <button
            type="button"
            className="btn-link document-viewer-back"
            onClick={closeDocument}
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

        <div className="document-pdf-viewer">
          <div className="document-pdf-toolbar" aria-label="Commandes du lecteur PDF">
            <div className="document-page-controls">
              <button
                type="button"
                onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
                disabled={!totalPages || pageNumber <= 1}
                aria-label="Page précédente"
              >
                ‹
              </button>
              <strong>{totalPages ? `Page ${pageNumber} / ${totalPages}` : 'Chargement…'}</strong>
              <button
                type="button"
                onClick={() => setPageNumber((value) => Math.min(totalPages, value + 1))}
                disabled={!totalPages || pageNumber >= totalPages}
                aria-label="Page suivante"
              >
                ›
              </button>
            </div>

            <div className="document-zoom-controls">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.25).toFixed(2))))}
                disabled={zoom <= 0.75}
                aria-label="Réduire le zoom"
              >
                −
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(2, Number((value + 0.25).toFixed(2))))}
                disabled={zoom >= 2}
                aria-label="Augmenter le zoom"
              >
                +
              </button>
            </div>
          </div>

          <div className="document-pdf-page-container" ref={pageContainerRef}>
            {viewerLoading && (
              <div className="document-viewer-loading" role="status" aria-live="polite">
                <span className="document-viewer-spinner" aria-hidden="true" />
                <strong>Chargement du document…</strong>
              </div>
            )}

            {viewerError && (
              <div className="document-viewer-error" role="alert">
                <strong>Document indisponible</strong>
                <p>{viewerError}</p>
                <button type="button" className="btn btn-primary" onClick={() => setReloadKey((value) => value + 1)}>
                  Réessayer
                </button>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className={`document-pdf-canvas ${viewerError ? 'is-hidden' : ''}`}
              aria-label={`${selectedDocument.title} — page ${pageNumber}`}
            />
          </div>
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
