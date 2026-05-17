import { useEffect, useMemo, useReducer, useRef } from 'react'
import { messages, loadLang, saveLang } from './i18n'
import { reducer, initialState } from './state'
import { ScoreBoard } from '../components/ScoreBoard'
import { TopBar } from '../components/TopBar'
import { UndoButton } from '../components/UndoButton'
import { SettingsModal } from '../components/SettingsModal'
import { WinnerOverlay } from '../components/WinnerOverlay'
import { DeadlockDialog } from '../components/DeadlockDialog'
import { ToastHost } from '../components/ToastHost'
import { createFullscreenAdapter } from '../adapters/fullscreen'
import { createInstallController } from '../adapters/installPrompt'
import { createSWController } from '../adapters/swUpdate'
import { createWakeLockController } from '../adapters/wakelock'
import { vibrateReset, vibrateScore } from '../adapters/vibration'

const fullscreen = createFullscreenAdapter()
const installer = createInstallController()
const swController = createSWController()
const wakeLock = createWakeLockController()

const isInstalled = (): boolean => {
  const m = window.matchMedia?.('(display-mode: standalone)').matches
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return Boolean(m || iosStandalone)
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(loadLang()))
  const lastScoreEventIdRef = useRef(0)
  const tx = useMemo(() => messages[state.lang], [state.lang])

  useEffect(() => {
    document.documentElement.lang = state.lang
    saveLang(state.lang)
  }, [state.lang])

  useEffect(() => {
    const w = window as Window & { __VOLEI_BOOT_TIMER__?: number }
    if (w.__VOLEI_BOOT_TIMER__) window.clearTimeout(w.__VOLEI_BOOT_TIMER__)
    const loader = document.getElementById('boot-loader')
    if (loader) loader.style.display = 'none'
  }, [])

  useEffect(() => {
    if (!state.winnerOverlayVisible) return
    const timer = window.setTimeout(() => dispatch({ type: 'WINNER_OVERLAY_TIMEOUT' }), 3000)
    return () => window.clearTimeout(timer)
  }, [state.winnerOverlayVisible])

  useEffect(() => {
    if (state.scoreEventId <= lastScoreEventIdRef.current) return
    lastScoreEventIdRef.current = state.scoreEventId
    vibrateScore()
  }, [state.scoreEventId])

  useEffect(() => {
    const stop = fullscreen.onChange((isFull) => {
      if (!isFull && state.fullscreenEnabled) {
        dispatch({ type: 'SET_FULLSCREEN_ENABLED', value: false })
        dispatch({ type: 'SHOW_TOAST', toastType: 'fullscreenHint' })
      }
    })
    return stop
  }, [state.fullscreenEnabled])

  useEffect(() => {
    if (state.fullscreenEnabled && !fullscreen.isFullscreen()) {
      void fullscreen.request().then((ok) => {
        if (!ok) dispatch({ type: 'SHOW_TOAST', toastType: 'fullscreenHint' })
      })
    }

    if (!state.fullscreenEnabled && fullscreen.isFullscreen()) {
      void fullscreen.exit()
    }
  }, [state.fullscreenEnabled])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void wakeLock.start()
    }

    const onFirstGesture = () => {
      void wakeLock.start()
      window.removeEventListener('pointerdown', onFirstGesture)
    }

    window.addEventListener('pointerdown', onFirstGesture, { once: true })
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pointerdown', onFirstGesture)
      void wakeLock.stop()
    }
  }, [])

  useEffect(() => {
    void swController.register(
      () => {
        dispatch({ type: 'SET_SW_UPDATE_AVAILABLE', value: true })
        dispatch({ type: 'SHOW_TOAST', toastType: 'updateAvailable' })
      },
      () => {
        dispatch({ type: 'SHOW_TOAST', toastType: 'offlineReady' })
        window.setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 2800)
      },
    )
  }, [])

  useEffect(() => {
    const cleanup = installer.init(() => {
      dispatch({ type: 'SHOW_INSTALL_HINT' })
      dispatch({ type: 'SHOW_TOAST', toastType: 'installHint' })
    })

    if (!isInstalled() && !installer.isDismissed()) {
      window.setTimeout(() => dispatch({ type: 'SHOW_TOAST', toastType: 'installHint' }), 1200)
    }

    return cleanup
  }, [])

  useEffect(() => {
    const warm = () => {
      void import('../confetti')
    }

    const rIC = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback

    if (typeof rIC === 'function') {
      rIC(warm, { timeout: 2000 })
      return
    }

    const timer = window.setTimeout(warm, 1200)
    return () => window.clearTimeout(timer)
  }, [])

  const handleToggleFullscreen = (enabled: boolean) => {
    dispatch({ type: 'SET_FULLSCREEN_ENABLED', value: enabled })
  }

  const handleHoldReset = () => {
    vibrateReset()
    dispatch({ type: 'RESET_SET' })
  }

  const handleToastInstall = () => {
    if (installer.canPrompt()) {
      void installer.prompt().then((outcome) => {
        if (outcome !== 'unavailable') dispatch({ type: 'CLEAR_TOAST' })
      })
      return
    }
    dispatch({ type: 'SHOW_TOAST', toastType: 'fullscreenHint' })
    window.setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 2500)
  }

  const handleDismissInstall = () => {
    installer.dismissHint()
    dispatch({ type: 'HIDE_INSTALL_HINT' })
    dispatch({ type: 'CLEAR_TOAST' })
  }

  const handleReloadUpdate = () => {
    void swController.applyUpdateAndReload()
  }

  return (
    <div className="relative h-screen w-screen select-none overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      <ScoreBoard state={state} dispatch={dispatch} tx={{ setPoint: tx.setPoint }} />

      <TopBar
        state={state}
        dispatch={dispatch}
        setToText={tx.setTo(state.target)}
        settingsLabel={tx.settings}
        resetLabel={tx.reset}
        onHoldReset={handleHoldReset}
      />

      <UndoButton state={state} dispatch={dispatch} label={tx.undo} />

      <SettingsModal
        state={state}
        dispatch={dispatch}
        tx={{
          settings: tx.settings,
          targetPoints: tx.targetPoints,
          language: tx.language,
          fullscreen: tx.fullscreen,
          reset: tx.reset,
          resetConfirm: tx.resetConfirm,
          confirm: tx.confirm,
          cancel: tx.cancel,
        }}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {state.winnerOverlayVisible && state.winner ? (
        <WinnerOverlay
          winner={state.winner}
          red={state.scores.red}
          blue={state.scores.blue}
          redWinsLabel={tx.redWins}
          blueWinsLabel={tx.blueWins}
          onTapTeam={(team) => dispatch({ type: 'SCORE_TAP', team })}
        />
      ) : null}

      {state.deadlock ? <DeadlockDialog message={tx.deadlock} newSetLabel={tx.newSet} onNewSet={() => dispatch({ type: 'RESET_SET' })} /> : null}

      <ToastHost
        toast={state.toast}
        tx={{
          deadlock: tx.deadlock,
          readyOffline: tx.readyOffline,
          updateAvailable: tx.updateAvailable,
          installHint: tx.installHint,
          installFullscreen: tx.installFullscreen,
          reload: tx.reload,
          installAction: tx.installAction,
        }}
        onReload={handleReloadUpdate}
        onInstall={handleToastInstall}
        onDismissInstall={handleDismissInstall}
      />
    </div>
  )
}
