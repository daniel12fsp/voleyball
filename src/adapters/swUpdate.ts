/**
 * Browser API adapter.
 * Testing policy: mock this module in component/app unit tests.
 */
export interface SWController {
  register(onUpdate: () => void, onOfflineReady: () => void): Promise<void>
  applyUpdateAndReload(): Promise<void>
}

export const createSWController = (): SWController => {
  let registration: ServiceWorkerRegistration | null = null

  const hasWaiting = (reg: ServiceWorkerRegistration): boolean => !!reg.waiting

  return {
    register: async (onUpdate, onOfflineReady) => {
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !navigator.serviceWorker) return

      registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)

      if (hasWaiting(registration)) onUpdate()
      if (registration.active && navigator.serviceWorker.controller) onOfflineReady()

      registration.addEventListener('updatefound', () => {
        const installing = registration?.installing
        if (!installing) return
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) onUpdate()
          if (installing.state === 'activated') onOfflineReady()
        })
      })
    },

    applyUpdateAndReload: async () => {
      if (typeof window === 'undefined') return
      if (registration?.waiting) {
        await new Promise<void>((resolve) => {
          const done = () => {
            navigator.serviceWorker.removeEventListener('controllerchange', done)
            resolve()
          }
          navigator.serviceWorker.addEventListener('controllerchange', done)
          registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
          setTimeout(done, 1500)
        })
      }
      window.location.reload()
    },
  }
}
