import type { Dispatch } from 'react'
import { type Action, type GameState } from '../app/state'
import { ResetHoldButton } from './ResetHoldButton'

interface Props {
  state: GameState
  dispatch: Dispatch<Action>
  setToText: string
  settingsLabel: string
  resetLabel: string
  onHoldReset: () => void
}

export function TopBar({ state, dispatch, setToText, settingsLabel, resetLabel, onHoldReset }: Props) {
  const disabledReset = state.winnerOverlayVisible || state.deadlock
  const cancelSignal = `${state.scores.red}-${state.scores.blue}-${state.settingsOpen}-${state.deadlock}-${state.winnerOverlayVisible}`

  return (
    <header className="pointer-events-none fixed top-[max(env(safe-area-inset-top),8px)] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
      <span className="pointer-events-auto rounded-full bg-black/55 px-3 py-1 text-xs font-bold tracking-wider text-white/85 backdrop-blur">
        {setToText}
      </span>
      <button
        type="button"
        className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
        onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        aria-label={settingsLabel}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <div className="pointer-events-auto">
        <ResetHoldButton disabled={disabledReset} cancelSignal={cancelSignal} ariaLabel={resetLabel} onComplete={onHoldReset} />
      </div>
    </header>
  )
}
