import test from 'node:test'
import assert from 'node:assert/strict'
import {
  defaultSettings,
  normalizeQuestionTimeSeconds,
  normalizeSettings,
  resolveDefaultQuestionCount,
} from '../src/utils/settings.js'

test('settings defaults stay stable and user values are normalized', () => {
  assert.deepEqual(defaultSettings(), {
    questionLot: 'lot1',
    defaultQuestionCount: 20,
    defaultMode: 'training',
    defaultTimed: false,
    questionTimeSeconds: 60,
    showExplanations: true,
    animationsEnabled: true,
    soundsEnabled: false,
    theme: 'system',
  })

  assert.deepEqual(normalizeSettings({
    questionLot: 'lot2',
    defaultQuestionCount: '30',
    defaultMode: 'exam',
    defaultTimed: true,
    questionTimeSeconds: 45,
    showExplanations: false,
    animationsEnabled: false,
    soundsEnabled: true,
    theme: 'dark',
  }), {
    questionLot: 'lot2',
    defaultQuestionCount: 30,
    defaultMode: 'exam',
    defaultTimed: true,
    questionTimeSeconds: 45,
    showExplanations: false,
    animationsEnabled: false,
    soundsEnabled: true,
    theme: 'dark',
  })
})

test('older saved settings inherit safe experience defaults', () => {
  const settings = normalizeSettings({
    defaultQuestionCount: 10,
    defaultMode: 'training',
    defaultTimed: false,
    questionTimeSeconds: 60,
    showExplanations: true,
    theme: 'system',
  })

  assert.equal(settings.questionLot, 'lot1')
  assert.equal(settings.animationsEnabled, true)
  assert.equal(settings.soundsEnabled, false)
})

test('custom question time accepts practical values and rejects out-of-range values', () => {
  assert.equal(normalizeQuestionTimeSeconds(30), 30)
  assert.equal(normalizeQuestionTimeSeconds('75'), 75)
  assert.equal(normalizeQuestionTimeSeconds(300), 300)
  assert.equal(normalizeQuestionTimeSeconds(9), 60)
  assert.equal(normalizeQuestionTimeSeconds(301), 60)
  assert.equal(normalizeQuestionTimeSeconds('invalid'), 60)
})

test('invalid settings fall back safely without losing valid preferences', () => {
  const settings = normalizeSettings({
    questionLot: 'lot99',
    defaultQuestionCount: 99,
    defaultMode: 'invalid',
    defaultTimed: 'yes',
    questionTimeSeconds: 999,
    showExplanations: true,
    animationsEnabled: 'yes',
    soundsEnabled: 1,
    theme: 'neon',
  })

  assert.equal(settings.questionLot, 'lot1')
  assert.equal(settings.defaultQuestionCount, 20)
  assert.equal(settings.defaultMode, 'training')
  assert.equal(settings.defaultTimed, false)
  assert.equal(settings.questionTimeSeconds, 60)
  assert.equal(settings.showExplanations, true)
  assert.equal(settings.animationsEnabled, true)
  assert.equal(settings.soundsEnabled, false)
  assert.equal(settings.theme, 'system')
})

test('default question count respects available questions and all preference', () => {
  assert.equal(resolveDefaultQuestionCount(20, 8), 8)
  assert.equal(resolveDefaultQuestionCount(30, 59), 30)
  assert.equal(resolveDefaultQuestionCount('all', 59), 59)
  assert.equal(resolveDefaultQuestionCount('all', 0), 0)
})
