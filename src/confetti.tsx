import { useMemo } from 'react'

const COLORS = ['#e94560', '#1f57d6', '#ffd700', '#ffffff', '#34d399', '#fb7185']

const rand = (min: number, max: number): number => min + Math.random() * (max - min)

export default function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => ({
        id: i,
        x: rand(-180, 180),
        y: rand(-220, -70),
        rot: rand(40, 740),
        delay: rand(0, 0.7),
        size: rand(4, 9),
        color: COLORS[i % COLORS.length],
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute left-1/2 top-1/2 block rounded-sm"
          style={{
            width: `${piece.size}px`,
            height: `${piece.size * 1.6}px`,
            backgroundColor: piece.color,
            animation: `confetti-fly 1.8s ease-out ${piece.delay}s forwards`,
            transform: `translate(-50%, -50%) translate(${piece.x}px, ${piece.y}px) rotate(${piece.rot}deg)`,
          }}
        />
      ))}
    </div>
  )
}
