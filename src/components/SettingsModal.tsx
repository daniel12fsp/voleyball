import { type Dispatch } from 'react'
import { type Action, type GameState } from '../app/state'

interface Props {
  state: GameState
  dispatch: Dispatch<Action>
  tx: {
    settings: string
    targetPoints: string
    language: string
    fullscreen: string
    reset: string
    resetConfirm: string
    confirm: string
    cancel: string
    installAction: string
  }
  onToggleFullscreen: (enabled: boolean) => void
  onInstall: () => void
}

export function SettingsModal({ state, dispatch, tx, onToggleFullscreen, onInstall }: Props) {
  if (!state.settingsOpen) return null

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
      onPointerDown={() => dispatch({ type: 'CLOSE_SETTINGS' })}
    >
      <section
        className="w-full max-w-sm rounded-2xl bg-slate-900 p-4 text-white shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">{tx.settings}</h2>
          <button type="button" className="rounded p-1 text-white/80" onClick={() => dispatch({ type: 'CLOSE_SETTINGS' })}>
            ✕
          </button>
        </div>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-white/75">{tx.targetPoints}</span>
          <input
            type="number"
            min={3}
            max={99}
            className="w-full rounded-md border border-white/20 bg-black/35 px-3 py-2"
            value={state.target}
            onChange={(e) => {
              dispatch({ type: 'SET_TARGET', value: Number(e.target.value) })
            }}
          />
        </label>

        <div className="mb-3 flex items-center justify-between rounded-md border border-white/15 p-2 text-sm">
          <span>{tx.language}</span>
          <button
            type="button"
            className="rounded bg-white/10 px-3 py-1"
            onClick={() => dispatch({ type: 'SET_LANG', value: state.lang === 'pt' ? 'en' : 'pt' })}
          >
            {state.lang === 'pt' ? 'PT' : 'EN'}
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-md border border-white/15 p-2 text-sm">
          <span>{tx.fullscreen}</span>
          <button
            type="button"
            className="rounded bg-white/10 px-3 py-1"
            onClick={() => onToggleFullscreen(!state.fullscreenEnabled)}
          >
            {state.fullscreenEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <button
          type="button"
          className="mb-4 w-full rounded-md bg-white px-4 py-2 text-sm font-bold text-neutral-900"
          onClick={onInstall}
        >
          {tx.installAction}
        </button>

        <button
          type="button"
          className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold"
          onClick={() => dispatch({ type: 'OPEN_RESET_CONFIRM' })}
        >
          {tx.reset}
        </button>

        {state.resetConfirmOpen ? (
          <div className="mt-3 rounded-md border border-white/20 bg-black/40 p-3 text-sm">
            <p className="mb-3">{tx.resetConfirm}</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded bg-rose-600 px-3 py-2"
                onClick={() => dispatch({ type: 'RESET_SET' })}
              >
                {tx.confirm}
              </button>
              <button
                type="button"
                className="flex-1 rounded bg-white/15 px-3 py-2"
                onClick={() => dispatch({ type: 'DISMISS_RESET_CONFIRM' })}
              >
                {tx.cancel}
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
