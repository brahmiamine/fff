import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultSettings, normalizeSettings, resolveDefaultQuestionCount } from '../src/utils/settings.js'

test('settings defaults stay stable and user values are normalized', () => {
  assert.deepEqual(defaultSettings(), {
    defaultQuestionCount: 20,
    defaultMode: 'training',
    defaultTimed: false,
    showExplanations: true,
    theme: 'system',
  })

  assert.deepEqual(normalizeSettings({
    defaultQuestionCount: '30',
    defaultMode: 'exam',
    defaultTimed: true,
    showExplanations: false,
    theme: 'dark',
  }), {
    defaultQuestionCount: 30,
    defaultMode: 'exam',
    defaultTimed: true,
    showExplanations: false,
    theme: 'dark',
  })
})

test('invalid settings fall back safely without losing valid preferences', () => {
  const settings = normalizeSettings({
    defaultQuestionCount: 99,
    defaultMode: 'invalid',
    defaultTimed: 'yes',
    showExplanations: true,
    theme: 'neon',
  })

  assert.equal(settings.defaultQuestionCount, 20)
  assert.equal(settings.defaultMode, 'training')
  assert.equal(settings.defaultTimed, false)
  assert.equal(settings.showExplanations, true)
  assert.equal(settings.theme, 'system')
})

test('default question count respects available questions and all preference', () => {
  assert.equal(resolveDefaultQuestionCount(20, 8), 8)
  assert.equal(resolveDefaultQuestionCount(30, 59), 30)
  assert.equal(resolveDefaultQuestionCount('all', 59), 59)
  assert.equal(resolveDefaultQuestionCount('all', 0), 0)
})
