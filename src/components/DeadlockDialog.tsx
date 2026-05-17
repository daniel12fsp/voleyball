interface Props {
  message: string
  newSetLabel: string
  onNewSet: () => void
}

export function DeadlockDialog({ message, newSetLabel, onNewSet }: Props) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4">
      <div className="max-w-sm rounded-xl bg-slate-900 p-4 text-white shadow-xl">
        <p className="mb-4 text-sm text-white/90">{message}</p>
        <button type="button" className="w-full rounded-md bg-white/15 px-4 py-2 text-sm font-semibold" onClick={onNewSet}>
          {newSetLabel}
        </button>
      </div>
    </div>
  )
}
