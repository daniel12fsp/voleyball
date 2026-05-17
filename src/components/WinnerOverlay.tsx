import { lazy, Suspense } from 'react'
import type { Team } from '../app/engine'

const LazyConfetti = lazy(() => import('../confetti'))

interface Props {
  winner: Team
  red: number
  blue: number
  redWinsLabel: string
  blueWinsLabel: string
  onTapTeam: (team: Team) => void
}

export function WinnerOverlay({ winner, red, blue, redWinsLabel, blueWinsLabel, onTapTeam }: Props) {
  const isRed = winner === 'red'
  const text = isRed ? redWinsLabel : blueWinsLabel
  const first = isRed ? red : blue
  const second = isRed ? blue : red

  return (
    <div className={`fixed inset-0 z-50 ${isRed ? 'bg-redTeam' : 'bg-blueTeam'} text-white`}>
      <Suspense fallback={null}>
        <LazyConfetti />
      </Suspense>

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-4xl font-black tracking-wide sm:text-6xl">{text}</p>
        <p className="text-3xl font-semibold sm:text-5xl">{first} – {second}</p>
      </div>

      <div className="absolute inset-0 z-20 flex">
        <button type="button" className="flex-1" aria-label="Red tap zone" onPointerDown={() => onTapTeam('red')} />
        <button type="button" className="flex-1" aria-label="Blue tap zone" onPointerDown={() => onTapTeam('blue')} />
      </div>
    </div>
  )
}
