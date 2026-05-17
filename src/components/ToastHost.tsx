import type { ToastMessage } from '../app/state'

interface Props {
  toast: ToastMessage | null
  tx: {
    deadlock: string
    readyOffline: string
    updateAvailable: string
    installHint: string
    installFullscreen: string
    reload: string
    installAction: string
  }
  onReload: () => void
  onInstall: () => void
  onDismissInstall: () => void
}

export function ToastHost({ toast, tx, onReload, onInstall, onDismissInstall }: Props) {
  if (!toast) return null

  if (toast.type === 'updateAvailable') {
    return (
      <div className="toast-shell">
        <span>{tx.updateAvailable}</span>
        <button type="button" className="toast-btn" onClick={onReload}>{tx.reload}</button>
      </div>
    )
  }

  if (toast.type === 'installHint') {
    return (
      <div className="toast-shell">
        <span>{tx.installHint}</span>
        <div className="flex items-center gap-2">
          <button type="button" className="toast-btn" onClick={onInstall}>{tx.installAction}</button>
          <button type="button" className="toast-btn" onClick={onDismissInstall}>✕</button>
        </div>
      </div>
    )
  }

  const message =
    toast.type === 'deadlock'
      ? tx.deadlock
      : toast.type === 'offlineReady'
        ? tx.readyOffline
        : toast.type === 'fullscreenHint'
          ? tx.installFullscreen
          : tx.deadlock

  return <div className="toast-shell">{message}</div>
}
