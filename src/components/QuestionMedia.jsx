import { getYouTubeEmbedUrl, resolveMediaUrl } from '../utils/media.js'

const BASE = import.meta.env.BASE_URL

export default function QuestionMedia({ question, compact = false }) {
  const imageUrl = question.image ? resolveMediaUrl(question.image, BASE) : null
  const videoUrl = question.video ? resolveMediaUrl(question.video, BASE) : null
  const youtubeEmbedUrl = question.video ? getYouTubeEmbedUrl(question.video) : null

  if (!imageUrl && !videoUrl) return null

  return (
    <div className={`question-media ${compact ? 'question-media-compact' : ''}`}>
      {imageUrl && (
        <div className="question-media-image-wrap">
          <img src={imageUrl} alt="" className="question-media-image" loading={compact ? 'lazy' : 'eager'} />
        </div>
      )}

      {videoUrl && (
        <div className="question-video-wrap">
          {youtubeEmbedUrl ? (
            <iframe
              className="question-video-frame"
              src={youtubeEmbedUrl}
              title={`Vidéo associée à la question : ${question.question}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <video
              className="question-video-player"
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
            >
              Ton navigateur ne permet pas de lire cette vidéo.
            </video>
          )}
        </div>
      )}
    </div>
  )
}
