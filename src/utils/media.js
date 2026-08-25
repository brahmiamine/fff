const SAFE_REMOTE_PROTOCOLS = new Set(['http:', 'https:'])
const YOUTUBE_HOSTS = new Set(['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'])

function normalizedHost(hostname) {
  return hostname.toLowerCase().replace(/^www\./, '')
}

function validYouTubeId(value) {
  if (typeof value !== 'string') return null
  const id = value.trim()
  return /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null
}

export function getYouTubeVideoId(value) {
  if (typeof value !== 'string' || !value.trim()) return null

  let url
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }

  const host = normalizedHost(url.hostname)
  if (!YOUTUBE_HOSTS.has(host)) return null

  if (host === 'youtu.be') {
    return validYouTubeId(url.pathname.split('/').filter(Boolean)[0])
  }

  if (url.pathname === '/watch') {
    return validYouTubeId(url.searchParams.get('v'))
  }

  const parts = url.pathname.split('/').filter(Boolean)
  if (['embed', 'shorts', 'live'].includes(parts[0])) {
    return validYouTubeId(parts[1])
  }

  return null
}

export function getYouTubeEmbedUrl(value) {
  const videoId = getYouTubeVideoId(value)
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
}

export function isSafeMediaReference(value) {
  if (typeof value !== 'string' || !value.trim()) return false
  const trimmed = value.trim()

  try {
    const url = new URL(trimmed)
    return SAFE_REMOTE_PROTOCOLS.has(url.protocol)
  } catch {
    return !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(trimmed)
  }
}

export function resolveMediaUrl(value, baseUrl = '/') {
  if (typeof value !== 'string' || !value.trim()) return null
  const trimmed = value.trim()

  try {
    const url = new URL(trimmed)
    if (SAFE_REMOTE_PROTOCOLS.has(url.protocol)) return url.toString()
    return null
  } catch {
    if (!isSafeMediaReference(trimmed)) return null
    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    return `${base}${trimmed.replace(/^\/+/, '')}`
  }
}
