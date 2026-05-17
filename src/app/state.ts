import { addPoint, atCap, canWinNextPoint, checkWinner, clampTarget, getWinner, isDeadlock, type Score, type Team } from './engine'

export type Lang = 'pt' | 'en'

export enum LockReason {
  none = 'none',
  settingsOpen = 'settingsOpen',
  invalidTargetAfterChange = 'invalidTargetAfterChange',
  deadlock = 'deadlock',
  winnerOverlay = 'winnerOverlay',
}

export type ToastType =
  | 'deadlock'
  | 'invalidTarget'
  | 'offlineReady'
  | 'updateAvailable'
  | 'fullscreenHint'
  | 'installHint'

export interface ToastMessage {
  id: number
  type: ToastType
}

export interface GameState {
  scores: Score
  target: number
  history: Score[]
  winner: Team | null
  winnerOverlayVisible: boolean
  pendingNewSet: boolean
  settingsOpen: boolean
  resetConfirmOpen: boolean
  deadlock: boolean
  invalidTargetLock: boolean
  lang: Lang
  fullscreenEnabled: boolean
  fullscreenHintVisible: boolean
  installHintVisible: boolean
  swUpdateAvailable: boolean
  toast: ToastMessage | null
  scoreEventId: number
  toastSeq: number
}

export type Action =
  | { type: 'SCORE_TAP'; team: Team }
  | { type: 'UNDO' }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'SET_TARGET'; value: number }
  | { type: 'SET_LANG'; value: Lang }
  | { type: 'RESET_SET' }
  | { type: 'WINNER_OVERLAY_TIMEOUT' }
  | { type: 'DISMISS_RESET_CONFIRM' }
  | { type: 'OPEN_RESET_CONFIRM' }
  | { type: 'SET_FULLSCREEN_ENABLED'; value: boolean }
  | { type: 'SHOW_FULLSCREEN_HINT' }
  | { type: 'HIDE_FULLSCREEN_HINT' }
  | { type: 'SHOW_INSTALL_HINT' }
  | { type: 'HIDE_INSTALL_HINT' }
  | { type: 'SET_SW_UPDATE_AVAILABLE'; value: boolean }
  | { type: 'SHOW_TOAST'; toastType: ToastType }
  | { type: 'CLEAR_TOAST'; id?: number }

export const initialState = (lang: Lang): GameState => ({
  scores: { red: 0, blue: 0 },
  target: 12,
  history: [],
  winner: null,
  winnerOverlayVisible: false,
  pendingNewSet: false,
  settingsOpen: false,
  resetConfirmOpen: false,
  deadlock: false,
  invalidTargetLock: false,
  lang,
  fullscreenEnabled: false,
  fullscreenHintVisible: false,
  installHintVisible: false,
  swUpdateAvailable: false,
  toast: null,
  scoreEventId: 0,
  toastSeq: 0,
})

export const getLockReason = (state: GameState): LockReason => {
  if (state.winnerOverlayVisible) return LockReason.winnerOverlay
  if (state.deadlock) return LockReason.deadlock
  if (state.invalidTargetLock) return LockReason.invalidTargetAfterChange
  if (state.settingsOpen) return LockReason.settingsOpen
  return LockReason.none
}

export const isUndoVisible = (state: GameState): boolean =>
  state.history.length > 0 && !state.settingsOpen && !state.winnerOverlayVisible && !state.deadlock && !state.invalidTargetLock && !state.pendingNewSet

export const getSetPoint = (state: GameState, team: Team): boolean => {
  const score = team === 'red' ? state.scores.red : state.scores.blue
  const other = team === 'red' ? state.scores.blue : state.scores.red
  return !state.winner && !state.deadlock && !state.invalidTargetLock && canWinNextPoint(score, other, state.target)
}

const withToast = (state: GameState, type: ToastType): GameState => {
  const id = state.toastSeq + 1
  return { ...state, toast: { id, type }, toastSeq: id }
}

const newSet = (state: GameState): GameState => ({
  ...state,
  scores: { red: 0, blue: 0 },
  history: [],
  winner: null,
  winnerOverlayVisible: false,
  pendingNewSet: false,
  deadlock: false,
  invalidTargetLock: false,
  settingsOpen: false,
  resetConfirmOpen: false,
})

export const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'SCORE_TAP': {
      if (state.winnerOverlayVisible || state.pendingNewSet) {
        const resetState = newSet(state)
        const nextScores = addPoint(resetState.scores, action.team)
        return {
          ...resetState,
          scores: nextScores,
          history: [resetState.scores],
          scoreEventId: state.scoreEventId + 1,
        }
      }

      if (getLockReason(state) !== LockReason.none) return state
      const currentTeamScore = action.team === 'red' ? state.scores.red : state.scores.blue
      if (atCap(currentTeamScore)) return state

      const nextScores = addPoint(state.scores, action.team)
      const nextHistory = [...state.history, state.scores]

      if (isDeadlock(nextScores)) {
        return withToast(
          {
            ...state,
            scores: nextScores,
            history: nextHistory,
            deadlock: true,
            scoreEventId: state.scoreEventId + 1,
          },
          'deadlock',
        )
      }

      const winner = getWinner(nextScores, state.target)
      if (winner) {
        return {
          ...state,
          scores: nextScores,
          history: nextHistory,
          winner,
          winnerOverlayVisible: true,
          pendingNewSet: false,
          scoreEventId: state.scoreEventId + 1,
        }
      }

      return { ...state, scores: nextScores, history: nextHistory, scoreEventId: state.scoreEventId + 1 }
    }

    case 'UNDO': {
      if (!isUndoVisible(state)) return state
      const prev = state.history[state.history.length - 1]!
      return { ...state, scores: prev, history: state.history.slice(0, -1), winner: null }
    }

    case 'TOGGLE_SETTINGS':
      if (state.deadlock || state.winnerOverlayVisible) return state
      return { ...state, settingsOpen: !state.settingsOpen, resetConfirmOpen: false }

    case 'OPEN_SETTINGS':
      if (state.deadlock || state.winnerOverlayVisible) return state
      return { ...state, settingsOpen: true, resetConfirmOpen: false }

    case 'CLOSE_SETTINGS':
      return { ...state, settingsOpen: false, resetConfirmOpen: false }

    case 'SET_TARGET': {
      const target = clampTarget(action.value)
      const next = { ...state, target }
      if (checkWinner(next.scores.red, next.scores.blue, target) || checkWinner(next.scores.blue, next.scores.red, target)) {
        return withToast({ ...next, invalidTargetLock: true, settingsOpen: false, resetConfirmOpen: false }, 'invalidTarget')
      }
      return next
    }

    case 'SET_LANG':
      return { ...state, lang: action.value }

    case 'RESET_SET':
      return newSet(state)

    case 'WINNER_OVERLAY_TIMEOUT':
      if (!state.winnerOverlayVisible) return state
      return { ...state, winnerOverlayVisible: false, pendingNewSet: true }

    case 'OPEN_RESET_CONFIRM':
      return { ...state, resetConfirmOpen: true }

    case 'DISMISS_RESET_CONFIRM':
      return { ...state, resetConfirmOpen: false }

    case 'SET_FULLSCREEN_ENABLED':
      return { ...state, fullscreenEnabled: action.value }

    case 'SHOW_FULLSCREEN_HINT':
      return { ...state, fullscreenHintVisible: true }

    case 'HIDE_FULLSCREEN_HINT':
      return { ...state, fullscreenHintVisible: false }

    case 'SHOW_INSTALL_HINT':
      return { ...state, installHintVisible: true }

    case 'HIDE_INSTALL_HINT':
      return { ...state, installHintVisible: false }

    case 'SET_SW_UPDATE_AVAILABLE':
      return { ...state, swUpdateAvailable: action.value }

    case 'SHOW_TOAST':
      return withToast(state, action.toastType)

    case 'CLEAR_TOAST':
      if (!state.toast) return state
      if (action.id && state.toast.id !== action.id) return state
      return { ...state, toast: null }

    default:
      return state
  }
}
