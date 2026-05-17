type WakeLockSentinelLike = { release: () => Promise<void> }

export interface WakeLockController {
  start(): Promise<void>
  stop(): Promise<void>
}

const FALLBACK_VIDEO_ID = 'wakelock-fallback-video'

const ensureFallbackVideo = (): HTMLVideoElement | null => {
  if (typeof document === 'undefined') return null
  const existing = document.getElementById(FALLBACK_VIDEO_ID)
  if (existing instanceof HTMLVideoElement) return existing

  const video = document.createElement('video')
  video.id = FALLBACK_VIDEO_ID
  video.muted = true
  video.loop = true
  video.playsInline = true
  video.style.position = 'fixed'
  video.style.width = '1px'
  video.style.height = '1px'
  video.style.opacity = '0'
  video.style.pointerEvents = 'none'
  video.src =
    'data:video/mp4;base64,AAAAHGZ0eXBNNFYgAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAGF21kYXQAAAKgBgX//6ncRem9AAAItW1vdgAAAHBjb2RlYwAGAAEAAAAMY29scmMABAAQAAQABAAAAAcAEAABAAAABAAH2mRlc2MAABAAIAAEAAQAAAAHAAAAAQAAAAIAAAAKABAACAAEAAQAAAD2AgAAAgAAAABhZHRhAAEAAAAKbHN0Y2VjAAIAAWZlYWQAAAABAAAAAQAAAAEBAAAIAAABAAgAAAAKZnJlZQAAAgAAAAARc3RzYwAAAAEAAAABAAAABWlzb21pAAAAFmNvbG9yX3ByaW1hcmllcwAAAAFjY29scgAAAAJqcGN0AAAAACYAAQA0AAAAAQAAAAEAAAABAAAAAgAAAAEAAAABAAAAAQAAAAIAAAABAAAAAQAAAQAAAAEAAAABAAAAAQAAAAltZGF0YQAAAAA='
  document.body.appendChild(video)
  return video
}

export const createWakeLockController = (): WakeLockController => {
  let sentinel: WakeLockSentinelLike | null = null
  let fallbackVideo: HTMLVideoElement | null = null

  const requestNative = async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !(navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock) {
      return false
    }
    try {
      sentinel = await (navigator as Navigator & { wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock.request('screen')
      return true
    } catch {
      sentinel = null
      return false
    }
  }

  const requestFallback = async (): Promise<void> => {
    fallbackVideo = ensureFallbackVideo()
    if (!fallbackVideo) return
    try {
      await fallbackVideo.play()
    } catch {
      // user gesture may be required; retry on next start()
    }
  }

  return {
    start: async () => {
      const ok = await requestNative()
      if (!ok) await requestFallback()
    },

    stop: async () => {
      if (sentinel) {
        try {
          await sentinel.release()
        } catch {
          // ignore
        }
        sentinel = null
      }
      if (fallbackVideo) {
        fallbackVideo.pause()
        fallbackVideo.remove()
        fallbackVideo = null
      }
    },
  }
}
