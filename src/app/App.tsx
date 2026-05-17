import { lazy, Suspense, useEffect, useMemo, useReducer, useRef } from 'react'
import { messages, loadLang, saveLang } from './i18n'
import { reducer, initialState } from './state'
import { ScoreBoard } from '../components/ScoreBoard'
import { TopBar } from '../components/TopBar'
import { UndoButton } from '../components/UndoButton'
import { SettingsModal } from '../components/SettingsModal'
import { DeadlockDialog } from '../components/DeadlockDialog'
import { ToastHost } from '../components/ToastHost'

const LazyWinnerOverlay = lazy(() => import('../components/WinnerOverlay').then((m) => ({ default: m.WinnerOverlay })))
import { createFullscreenAdapter } from '../adapters/fullscreen'
import { createInstallController } from '../adapters/installPrompt'
import { createSWController } from '../adapters/swUpdate'
import { createWakeLockController } from '../adapters/wakelock'
import { vibrateScore } from '../adapters/vibration'

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
      if (installer.isDismissed()) return
      dispatch({ type: 'SHOW_INSTALL_HINT' })
      dispatch({ type: 'SHOW_TOAST', toastType: 'installHint' })
      installer.dismissHint()
    })

    if (!isInstalled() && !installer.isDismissed()) {
      const id = window.setTimeout(() => {
        dispatch({ type: 'SHOW_TOAST', toastType: 'installHint' })
        installer.dismissHint()
      }, 1200)
      return () => {
        cleanup()
        window.clearTimeout(id)
      }
    }

    return cleanup
  }, [])


  const handleToggleFullscreen = (enabled: boolean) => {
    dispatch({ type: 'SET_FULLSCREEN_ENABLED', value: enabled })
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

  const handleSettingsInstall = () => {
    if (!installer.canPrompt()) return
    void installer.prompt()
  }

  // auto-dismiss installHint toast after 5s
  useEffect(() => {
    if (!state.toast || state.toast.type !== 'installHint') return
    const id = window.setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 5000)
    return () => window.clearTimeout(id)
  }, [state.toast])

  const handleDismissToast = () => {
    if (state.toast?.type === 'installHint') {
      installer.dismissHint()
      dispatch({ type: 'HIDE_INSTALL_HINT' })
    }
    dispatch({ type: 'CLEAR_TOAST' })
  }

  const toastMessage = useMemo(() => {
    if (!state.toast) return ''
    switch (state.toast.type) {
      case 'deadlock':
        return tx.deadlock
      case 'invalidTarget':
        return tx.invalidTarget
      case 'offlineReady':
        return tx.readyOffline
      case 'updateAvailable':
        return tx.updateAvailable
      case 'fullscreenHint':
        return tx.installFullscreen
      case 'installHint':
        return tx.installHint
    }
  }, [state.toast, tx])

  const toastActions = useMemo(() => {
    if (!state.toast) return undefined
    const actions: { label: string; onClick: () => void }[] = []

    if (state.toast.type === 'updateAvailable') {
      actions.push({ label: tx.reload, onClick: handleReloadUpdate })
    }

    if (state.toast.type === 'installHint') {
      actions.push({ label: tx.installAction, onClick: handleToastInstall })
    }

    if (state.toast.type === 'invalidTarget') {
      const toastId = state.toast.id
      actions.push({
        label: tx.reset,
        onClick: () => {
          dispatch({ type: 'CLEAR_TOAST', id: toastId })
          dispatch({ type: 'OPEN_SETTINGS' })
          dispatch({ type: 'OPEN_RESET_CONFIRM' })
        },
      })
    }

    return actions.length > 0 ? actions : undefined
  }, [state.toast, tx])

  const handleReloadUpdate = () => {
    void swController.applyUpdateAndReload()
  }

  return (
    <div className="relative h-screen w-screen select-none overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      <ScoreBoard state={state} dispatch={dispatch} tx={{ setPoint: tx.setPoint, red: tx.red, blue: tx.blue }} />

      <TopBar dispatch={dispatch} setToText={tx.setTo(state.target)} settingsLabel={tx.settings} />

      <UndoButton state={state} dispatch={dispatch} label={tx.undo} holdLabel={tx.hold} />

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
          installAction: tx.installAction,
        }}
        onToggleFullscreen={handleToggleFullscreen}
        onInstall={handleSettingsInstall}
      />

      {state.winnerOverlayVisible && state.winner ? (
        <Suspense fallback={null}>
          <LazyWinnerOverlay
            winner={state.winner}
            red={state.scores.red}
            blue={state.scores.blue}
            redWinsLabel={tx.redWins}
            blueWinsLabel={tx.blueWins}
            onTapTeam={() => dispatch({ type: 'RESET_SET' })}
          />
        </Suspense>
      ) : null}

      {state.deadlock ? <DeadlockDialog message={tx.deadlock} newSetLabel={tx.newSet} onNewSet={() => dispatch({ type: 'RESET_SET' })} /> : null}

      <ToastHost
        toast={state.toast}
        message={toastMessage}
        actions={toastActions}
        onDismiss={handleDismissToast}
      />
    </div>
  )
}
