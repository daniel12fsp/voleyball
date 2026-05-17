import { createFullscreenAdapter } from '../adapters/fullscreen'
import { createInstallController } from '../adapters/installPrompt'
import { createSWController } from '../adapters/swUpdate'

describe('fullscreen adapter', () => {
  it('tracks fullscreen changes', () => {
    const adapter = createFullscreenAdapter()
    const cb = vi.fn()
    const off = adapter.onChange(cb)

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => document.documentElement,
    })

    document.dispatchEvent(new Event('fullscreenchange'))
    expect(cb).toHaveBeenCalledWith(true)

    off()
  })
})

describe('install adapter', () => {
  it('stores dismissal and handles unavailable prompt', async () => {
    const install = createInstallController()
    localStorage.removeItem('install-hint:v1')

    expect(install.isDismissed()).toBe(false)
    install.dismissHint()
    expect(install.isDismissed()).toBe(true)
    expect(await install.prompt()).toBe('unavailable')
  })
})

describe('service worker adapter', () => {
  it('returns without SW support', async () => {
    const original = navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: undefined })

    const sw = createSWController()
    await expect(sw.register(vi.fn(), vi.fn())).resolves.toBeUndefined()

    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: original })
  })
})
