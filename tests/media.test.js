import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getYouTubeEmbedUrl,
  getYouTubeVideoId,
  isSafeMediaReference,
  resolveMediaUrl,
} from '../src/utils/media.js'

test('extracts YouTube ids from common URL formats', () => {
  assert.equal(getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
  assert.equal(getYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?t=12'), 'dQw4w9WgXcQ')
  assert.equal(getYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
  assert.equal(getYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
})

test('builds privacy-enhanced YouTube embed URLs', () => {
  assert.equal(
    getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  )
  assert.equal(getYouTubeEmbedUrl('https://example.com/video.mp4'), null)
})

test('resolves local and remote video references', () => {
  assert.equal(resolveMediaUrl('videos/decision.mp4', '/fff/'), '/fff/videos/decision.mp4')
  assert.equal(resolveMediaUrl('/videos/decision.webm', '/fff/'), '/fff/videos/decision.webm')
  assert.equal(resolveMediaUrl('https://cdn.example.com/decision.mp4', '/fff/'), 'https://cdn.example.com/decision.mp4')
})

test('rejects unsafe media protocols', () => {
  assert.equal(isSafeMediaReference('https://example.com/video.mp4'), true)
  assert.equal(isSafeMediaReference('videos/video.mp4'), true)
  assert.equal(isSafeMediaReference('javascript:alert(1)'), false)
  assert.equal(isSafeMediaReference('data:text/html;base64,abc'), false)
  assert.equal(resolveMediaUrl('javascript:alert(1)', '/fff/'), null)
})
