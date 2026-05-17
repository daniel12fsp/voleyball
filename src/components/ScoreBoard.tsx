import type { Dispatch } from 'react'
import { getSetPoint, type Action, type GameState } from '../app/state'

interface Props {
  state: GameState
  dispatch: Dispatch<Action>
  tx: {
    setPoint: string
    red: string
    blue: string
  }
}

export function ScoreBoard({ state, dispatch, tx }: Props) {
  const showRedSetPoint = getSetPoint(state, 'red')
  const showBlueSetPoint = getSetPoint(state, 'blue')

  return (
    <main className="fixed inset-0 flex flex-col landscape:flex-row md:flex-row" aria-label="Volleyball scoreboard">
      <button
        type="button"
        className="relative flex-1 bg-redTeam text-white"
        onPointerDown={(e) => {
          e.preventDefault()
          dispatch({ type: 'SCORE_TAP', team: 'red' })
        }}
        aria-label={`${tx.red}: ${state.scores.red}`}
      >
        <span className="score-text">{state.scores.red}</span>
        {showRedSetPoint ? <span className="set-point-label left-6">{tx.setPoint}</span> : null}
      </button>

      <div className="h-px w-full bg-white/20 landscape:h-full landscape:w-px md:h-full md:w-px" />

      <button
        type="button"
        className="relative flex-1 bg-blueTeam text-white"
        onPointerDown={(e) => {
          e.preventDefault()
          dispatch({ type: 'SCORE_TAP', team: 'blue' })
        }}
        aria-label={`${tx.blue}: ${state.scores.blue}`}
      >
        <span className="score-text">{state.scores.blue}</span>
        {showBlueSetPoint ? <span className="set-point-label right-6">{tx.setPoint}</span> : null}
      </button>
    </main>
  )
}
