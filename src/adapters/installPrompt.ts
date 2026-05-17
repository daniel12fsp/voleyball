/**
 * Browser API adapter.
 * Testing policy: mock this module in component/app unit tests.
 */
const DISMISS_KEY = 'install-hint:v1'

export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface InstallController {
  init(onAvailable: () => void): () => void
  canPrompt(): boolean
  prompt(): Promise<'accepted' | 'dismissed' | 'unavailable'>
  dismissHint(): void
  isDismissed(): boolean
}

export const createInstallController = (): InstallController => {
  let deferred: InstallPromptEvent | null = null

  const isDismissed = (): boolean => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  }

  return {
    init: (onAvailable) => {
      const onBeforeInstallPrompt = (event: Event) => {
        event.preventDefault()
        deferred = event as InstallPromptEvent
        if (!isDismissed()) onAvailable()
      }

      const onInstalled = () => {
        deferred = null
      }

      window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.addEventListener('appinstalled', onInstalled)

      return () => {
        window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
        window.removeEventListener('appinstalled', onInstalled)
      }
    },

    canPrompt: () => !!deferred,

    prompt: async () => {
      if (!deferred) return 'unavailable'
      await deferred.prompt()
      const result = await deferred.userChoice
      if (result.outcome === 'accepted') deferred = null
      return result.outcome
    },

    dismissHint: () => {
      try {
        localStorage.setItem(DISMISS_KEY, '1')
      } catch {
        // ignore
      }
    },

    isDismissed,
  }
}
