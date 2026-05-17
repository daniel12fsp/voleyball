import { useCallback, useEffect, useRef } from 'react'

interface Props {
  disabled: boolean
  cancelSignal: string
  ariaLabel: string
  onComplete: () => void
}

export function ResetHoldButton({ disabled, cancelSignal, ariaLabel, onComplete }: Props) {
  const holdRef = useRef<{ start: number; raf: number } | null>(null)
  const ringRef = useRef<SVGCircleElement | null>(null)
  const circumference = 2 * Math.PI * 15

  const cancelHold = useCallback(() => {
    if (!holdRef.current) return
    cancelAnimationFrame(holdRef.current.raf)
    holdRef.current = null
    if (ringRef.current) ringRef.current.style.strokeDashoffset = `${circumference}`
  }, [circumference])

  useEffect(() => {
    cancelHold()
  }, [cancelSignal, cancelHold])

  useEffect(() => cancelHold, [cancelHold])

  if (disabled) return null

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="group relative ml-2 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
      onPointerDown={(e) => {
        e.preventDefault()
        if (holdRef.current) return

        const duration = 3000
        const start = performance.now()

        const tick = (now: number) => {
          if (!holdRef.current) return
          const progress = Math.min((now - start) / duration, 1)
          if (ringRef.current) {
            ringRef.current.style.strokeDashoffset = `${circumference * (1 - progress)}`
          }
          if (progress >= 1) {
            holdRef.current = null
            onComplete()
            return
          }
          holdRef.current.raf = requestAnimationFrame(tick)
        }

        holdRef.current = { start, raf: requestAnimationFrame(tick) }
      }}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
      <svg className="pointer-events-none absolute" width="36" height="36" viewBox="0 0 36 36" aria-hidden>
        <circle
          ref={ringRef}
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
    </button>
  )
}
