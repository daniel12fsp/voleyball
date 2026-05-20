/**
 * Browser API adapter.
 * Testing policy: mock this module in component/app unit tests.
 */
export interface FullscreenAdapter {
  isFullscreen(): boolean
  request(): Promise<boolean>
  exit(): Promise<boolean>
  onChange(cb: (isFullscreen: boolean) => void): () => void
}

export const createFullscreenAdapter = (): FullscreenAdapter => ({
  isFullscreen: () => typeof document !== 'undefined' && !!document.fullscreenElement,

  request: async () => {
    if (typeof document === 'undefined' || !document.documentElement.requestFullscreen) return false
    try {
      await document.documentElement.requestFullscreen()
      return true
    } catch {
      return false
    }
  },

  exit: async () => {
    if (typeof document === 'undefined' || !document.fullscreenElement || !document.exitFullscreen) return false
    try {
      await document.exitFullscreen()
      return true
    } catch {
      return false
    }
  },

  onChange: (cb) => {
    if (typeof document === 'undefined') return () => {}
    const handler = () => cb(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  },
})
