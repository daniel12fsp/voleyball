import type { Dispatch } from 'react'
import { isUndoVisible, type Action, type GameState } from '../app/state'

interface Props {
  state: GameState
  dispatch: Dispatch<Action>
  label: string
}

export function UndoButton({ state, dispatch, label }: Props) {
  if (!isUndoVisible(state)) return null

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'UNDO' })}
      className="fixed bottom-[max(env(safe-area-inset-bottom),16px)] left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/65 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg backdrop-blur"
    >
      {label}
    </button>
  )
}
