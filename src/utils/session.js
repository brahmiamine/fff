export function getRemainingSeconds(deadlineAt, fallbackSeconds, now = Date.now()) {
  if (!deadlineAt) return fallbackSeconds ?? null
  return Math.max(0, Math.ceil((deadlineAt - now) / 1000))
}

export function pauseTimedState(state, now = Date.now()) {
  if (!state.timeLimitSeconds) return { ...state, deadlineAt: null, remainingSeconds: null }
  return {
    ...state,
    deadlineAt: null,
    remainingSeconds: getRemainingSeconds(state.deadlineAt, state.remainingSeconds ?? state.timeLimitSeconds, now),
  }
}

export function resumeTimedState(state, now = Date.now()) {
  if (!state.timeLimitSeconds) return { ...state, deadlineAt: null, remainingSeconds: null }
  const remaining = state.remainingSeconds ?? state.timeLimitSeconds
  return { ...state, deadlineAt: now + remaining * 1000, remainingSeconds: remaining }
}

export function normalizeSavedSession(state, now = Date.now()) {
  if (!state || !state.timeLimitSeconds) return state

  // Migration from the former startedAt-based timer.
  if (!state.deadlineAt && state.startedAt && state.screen === 'quiz') {
    const remaining = Math.max(0, state.timeLimitSeconds - Math.floor((now - state.startedAt) / 1000))
    return { ...state, deadlineAt: now + remaining * 1000, remainingSeconds: remaining, startedAt: undefined }
  }

  if (state.screen === 'home') {
    return pauseTimedState(state, now)
  }

  return {
    ...state,
    remainingSeconds: getRemainingSeconds(state.deadlineAt, state.remainingSeconds ?? state.timeLimitSeconds, now),
  }
}
