let audioContext = null

export const SOUND_PATTERNS = Object.freeze({
  correct: [
    { frequency: 660, duration: 0.07, gain: 0.045, offset: 0 },
    { frequency: 880, duration: 0.1, gain: 0.05, offset: 0.08 },
  ],
  wrong: [
    { frequency: 240, duration: 0.09, gain: 0.04, offset: 0 },
    { frequency: 180, duration: 0.12, gain: 0.04, offset: 0.1 },
  ],
  success: [
    { frequency: 523.25, duration: 0.1, gain: 0.045, offset: 0 },
    { frequency: 659.25, duration: 0.1, gain: 0.045, offset: 0.11 },
    { frequency: 783.99, duration: 0.16, gain: 0.05, offset: 0.22 },
  ],
  tick: [
    { frequency: 920, duration: 0.045, gain: 0.025, offset: 0 },
  ],
  timeout: [
    { frequency: 190, duration: 0.12, gain: 0.04, offset: 0 },
    { frequency: 145, duration: 0.18, gain: 0.045, offset: 0.13 },
  ],
})

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextCtor) return null
  if (!audioContext) audioContext = new AudioContextCtor()
  return audioContext
}

function schedulePattern(context, pattern) {
  const startAt = context.currentTime + 0.01

  pattern.forEach(({ frequency, duration, gain, offset }) => {
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const toneStart = startAt + offset
    const toneEnd = toneStart + duration

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, toneStart)
    gainNode.gain.setValueAtTime(0.0001, toneStart)
    gainNode.gain.exponentialRampToValueAtTime(gain, toneStart + 0.012)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, toneEnd)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start(toneStart)
    oscillator.stop(toneEnd + 0.02)
  })
}

export async function unlockAudio(enabled = true) {
  if (!enabled) return false
  const context = getAudioContext()
  if (!context) return false

  try {
    if (context.state === 'suspended') await context.resume()
    return context.state === 'running'
  } catch {
    return false
  }
}

export async function playSound(name, enabled = true) {
  if (!enabled) return false
  const pattern = SOUND_PATTERNS[name]
  if (!pattern) return false

  const context = getAudioContext()
  if (!context) return false

  try {
    if (context.state === 'suspended') await context.resume()
    if (context.state !== 'running') return false
    schedulePattern(context, pattern)
    return true
  } catch {
    return false
  }
}
