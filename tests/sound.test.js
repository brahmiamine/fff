import test from 'node:test'
import assert from 'node:assert/strict'
import { SOUND_PATTERNS, playSound, unlockAudio } from '../src/utils/sound.js'

test('sound engine exposes all application feedback cues', () => {
  assert.deepEqual(Object.keys(SOUND_PATTERNS).sort(), ['correct', 'success', 'tick', 'timeout', 'wrong'])
  Object.values(SOUND_PATTERNS).forEach((pattern) => {
    assert.ok(pattern.length > 0)
    pattern.forEach((tone) => {
      assert.ok(tone.frequency > 0)
      assert.ok(tone.duration > 0)
      assert.ok(tone.gain > 0)
      assert.ok(tone.offset >= 0)
    })
  })
})

test('sound engine fails safely when audio is disabled or unavailable', async () => {
  assert.equal(await playSound('correct', false), false)
  assert.equal(await playSound('unknown', true), false)
  assert.equal(await unlockAudio(false), false)
  assert.equal(await unlockAudio(true), false)
})
