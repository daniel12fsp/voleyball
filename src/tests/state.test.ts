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

  it('enters winner overlay and pending new set', () => {
    let state = initialState('pt')
    state = { ...state, target: 3 }
    state = reducer(state, { type: 'SCORE_TAP', team: 'red' })
    state = reducer(state, { type: 'SCORE_TAP', team: 'red' })
    state = reducer(state, { type: 'SCORE_TAP', team: 'red' })

    expect(state.winner).toBe('red')
    expect(state.winnerOverlayVisible).toBe(true)

    const timeout = reducer(state, { type: 'WINNER_OVERLAY_TIMEOUT' })
    expect(timeout.winnerOverlayVisible).toBe(false)
    expect(timeout.pendingNewSet).toBe(true)

    const nextTap = reducer(timeout, { type: 'SCORE_TAP', team: 'blue' })
    expect(nextTap.scores).toEqual({ red: 0, blue: 1 })
    expect(nextTap.history).toEqual([{ red: 0, blue: 0 }])
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
})
