/**
 * Browser API adapter.
 * Testing policy: mock this module in component/app unit tests.
 */
export const vibrate = (pattern: number | number[]): void => {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  navigator.vibrate(pattern)
}

export const vibrateScore = (): void => vibrate(40)
export const vibrateReset = (): void => vibrate([50, 100, 50])
export const vibrateUndo = (): void => vibrate(25)
