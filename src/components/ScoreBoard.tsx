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
        className="score-zone relative flex-1 bg-redTeam text-white"
        style={{ ['--score-glow' as never]: 'rgba(229,57,53,0.55)' }}
        onPointerDown={(e) => {
          e.preventDefault()
          dispatch({ type: 'SCORE_TAP', team: 'red' })
        }}
        aria-label={`${tx.red}: ${state.scores.red}`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 pb-6">
          <span className="text-[clamp(0.9rem,4.2vw,2.4rem)] font-extrabold tracking-[0.28em] opacity-90">{tx.red}</span>
          <span className="score-text">{state.scores.red}</span>
        </div>
        {showRedSetPoint ? <span className="set-point-label left-6">{tx.setPoint}</span> : null}
      </button>

      <div className="pointer-events-none h-3 w-full bg-black/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.35)] landscape:h-full landscape:w-3" />

      <button
        type="button"
        className="score-zone relative flex-1 bg-blueTeam text-white"
        style={{ ['--score-glow' as never]: 'rgba(30,136,229,0.55)' }}
        onPointerDown={(e) => {
          e.preventDefault()
          dispatch({ type: 'SCORE_TAP', team: 'blue' })
        }}
        aria-label={`${tx.blue}: ${state.scores.blue}`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 pb-6">
          <span className="text-[clamp(0.9rem,4.2vw,2.4rem)] font-extrabold tracking-[0.28em] opacity-90">{tx.blue}</span>
          <span className="score-text">{state.scores.blue}</span>
        </div>
        {showBlueSetPoint ? <span className="set-point-label right-6">{tx.setPoint}</span> : null}
      </button>
    </main>
  )
}
