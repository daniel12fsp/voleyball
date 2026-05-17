import { initialState, reducer, getLockReason, LockReason, isUndoVisible } from '../app/state'

describe('state reducer', () => {
  it('scores under normal play', () => {
    const start = initialState('pt')
    const s1 = reducer(start, { type: 'SCORE_TAP', team: 'red' })
    expect(s1.scores.red).toBe(1)
    expect(s1.history).toEqual([{ red: 0, blue: 0 }])
  })

  it('blocks score while settings open', () => {
    const open = reducer(initialState('pt'), { type: 'OPEN_SETTINGS' })
    const blocked = reducer(open, { type: 'SCORE_TAP', team: 'red' })
    expect(blocked.scores.red).toBe(0)
  })

  it('supports undo only in active play', () => {
    const start = initialState('pt')
    const s1 = reducer(start, { type: 'SCORE_TAP', team: 'blue' })
    expect(isUndoVisible(s1)).toBe(true)
    const undo = reducer(s1, { type: 'UNDO' })
    expect(undo.scores).toEqual({ red: 0, blue: 0 })
    expect(isUndoVisible(start)).toBe(false)
  })

  it('enters winner overlay; score taps are ignored until reset', () => {
    let state = initialState('pt')
    state = { ...state, target: 3 }
    state = reducer(state, { type: 'SCORE_TAP', team: 'red' })
    state = reducer(state, { type: 'SCORE_TAP', team: 'red' })
    state = reducer(state, { type: 'SCORE_TAP', team: 'red' })

    expect(state.winner).toBe('red')
    expect(state.winnerOverlayVisible).toBe(true)

    const ignored = reducer(state, { type: 'SCORE_TAP', team: 'blue' })
    expect(ignored).toEqual(state)

    const reset = reducer(state, { type: 'RESET_SET' })
    expect(reset.scores).toEqual({ red: 0, blue: 0 })
    expect(reset.winnerOverlayVisible).toBe(false)
  })

  it('freezes deadlock at 99-99', () => {
    let state = initialState('pt')
    state = { ...state, scores: { red: 99, blue: 98 }, history: [{ red: 0, blue: 0 }] }
    const deadlocked = reducer(state, { type: 'SCORE_TAP', team: 'blue' })

    expect(deadlocked.deadlock).toBe(true)
    expect(deadlocked.scores).toEqual({ red: 99, blue: 99 })

    const blocked = reducer(deadlocked, { type: 'SCORE_TAP', team: 'red' })
    expect(blocked.scores).toEqual({ red: 99, blue: 99 })
  })

  it('freezes when target change creates winner', () => {
    let state = initialState('pt')
    state = { ...state, scores: { red: 8, blue: 5 }, target: 12 }
    const changed = reducer(state, { type: 'SET_TARGET', value: 7 })

    expect(changed.invalidTargetLock).toBe(true)
    expect(getLockReason(changed)).toBe(LockReason.invalidTargetAfterChange)

    const blocked = reducer(changed, { type: 'SCORE_TAP', team: 'red' })
    expect(blocked.scores).toEqual({ red: 8, blue: 5 })
  })

  it('clamps target value', () => {
    const state = initialState('pt')
    expect(reducer(state, { type: 'SET_TARGET', value: 1 }).target).toBe(3)
    expect(reducer(state, { type: 'SET_TARGET', value: 120 }).target).toBe(99)
  })

  it('enforces lock precedence', () => {
    const s = {
      ...initialState('pt'),
      settingsOpen: true,
      invalidTargetLock: true,
      deadlock: true,
      winnerOverlayVisible: true,
    }
    expect(getLockReason(s)).toBe(LockReason.winnerOverlay)
  })

  it('blocks score at team cap', () => {
    const state = { ...initialState('pt'), scores: { red: 99, blue: 20 } }
    const next = reducer(state, { type: 'SCORE_TAP', team: 'red' })
    expect(next).toEqual(state)
  })

  it('toggles/opens/closes settings unless locked by deadlock or winner overlay', () => {
    const start = initialState('pt')
    const toggled = reducer(start, { type: 'TOGGLE_SETTINGS' })
    expect(toggled.settingsOpen).toBe(true)

    const opened = reducer(start, { type: 'OPEN_SETTINGS' })
    expect(opened.settingsOpen).toBe(true)

    const closed = reducer({ ...opened, resetConfirmOpen: true }, { type: 'CLOSE_SETTINGS' })
    expect(closed.settingsOpen).toBe(false)
    expect(closed.resetConfirmOpen).toBe(false)

    const deadlockBlocked = reducer({ ...start, deadlock: true }, { type: 'TOGGLE_SETTINGS' })
    expect(deadlockBlocked.settingsOpen).toBe(false)

    const winnerBlocked = reducer({ ...start, winnerOverlayVisible: true }, { type: 'OPEN_SETTINGS' })
    expect(winnerBlocked.settingsOpen).toBe(false)
  })

  it('handles misc state actions and toast lifecycle', () => {
    let state = initialState('pt')

    state = reducer(state, { type: 'SET_LANG', value: 'en' })
    expect(state.lang).toBe('en')

    state = reducer(state, { type: 'OPEN_RESET_CONFIRM' })
    expect(state.resetConfirmOpen).toBe(true)

    state = reducer(state, { type: 'DISMISS_RESET_CONFIRM' })
    expect(state.resetConfirmOpen).toBe(false)

    state = reducer(state, { type: 'SET_FULLSCREEN_ENABLED', value: true })
    expect(state.fullscreenEnabled).toBe(true)

    state = reducer(state, { type: 'SHOW_FULLSCREEN_HINT' })
    expect(state.fullscreenHintVisible).toBe(true)

    state = reducer(state, { type: 'HIDE_FULLSCREEN_HINT' })
    expect(state.fullscreenHintVisible).toBe(false)

    state = reducer(state, { type: 'SHOW_INSTALL_HINT' })
    expect(state.installHintVisible).toBe(true)

    state = reducer(state, { type: 'HIDE_INSTALL_HINT' })
    expect(state.installHintVisible).toBe(false)

    state = reducer(state, { type: 'SET_SW_UPDATE_AVAILABLE', value: true })
    expect(state.swUpdateAvailable).toBe(true)

    state = reducer(state, { type: 'SHOW_TOAST', toastType: 'offlineReady' })
    expect(state.toast?.type).toBe('offlineReady')

    const withToast = state
    const wrongId = reducer(withToast, { type: 'CLEAR_TOAST', id: 999 })
    expect(wrongId.toast).toEqual(withToast.toast)

    const cleared = reducer(withToast, { type: 'CLEAR_TOAST', id: withToast.toast?.id })
    expect(cleared.toast).toBeNull()

    const noToast = reducer(cleared, { type: 'CLEAR_TOAST' })
    expect(noToast).toEqual(cleared)
  })

  it('closes winner overlay on timeout when visible (legacy action)', () => {
    const state = { ...initialState('pt'), winnerOverlayVisible: true, winner: 'red' as const }
    const next = reducer(state, { type: 'WINNER_OVERLAY_TIMEOUT' })
    expect(next.winnerOverlayVisible).toBe(false)
    expect(next.pendingNewSet).toBe(true)
  })

  it('ignores overlay timeout when overlay is hidden', () => {
    const state = initialState('pt')
    const next = reducer(state, { type: 'WINNER_OVERLAY_TIMEOUT' })
    expect(next).toEqual(state)
  })

  it('handles reset action and default reducer branch', () => {
    const dirty = {
      ...initialState('pt'),
      scores: { red: 10, blue: 8 },
      history: [{ red: 0, blue: 0 }],
      winner: 'red' as const,
      winnerOverlayVisible: true,
      deadlock: true,
      invalidTargetLock: true,
      settingsOpen: true,
      resetConfirmOpen: true,
    }

    const reset = reducer(dirty, { type: 'RESET_SET' })
    expect(reset.scores).toEqual({ red: 0, blue: 0 })
    expect(reset.history).toEqual([])
    expect(reset.winner).toBeNull()
    expect(reset.deadlock).toBe(false)
    expect(reset.invalidTargetLock).toBe(false)
    expect(reset.settingsOpen).toBe(false)
    expect(reset.resetConfirmOpen).toBe(false)

    const unknown = reducer(reset, { type: 'UNKNOWN' } as never)
    expect(unknown).toEqual(reset)
  })
})
