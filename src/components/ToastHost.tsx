import type { ToastMessage } from "../app/state";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Props {
  toast: ToastMessage | null;
  message: string;
  onDismiss: () => void;
  actions?: ToastAction[] | undefined;
}

export function ToastHost({ toast, message, onDismiss, actions }: Props) {
  if (!toast) return null;

  return (
    <div
      className="topbar-offset fixed left-1/2 z-[60] w-[min(92vw,380px)] -translate-x-1/2 rounded-2xl p-4 pr-10 text-sm font-medium leading-relaxed text-white shadow-xl backdrop-blur-xl"
      style={{ backgroundColor: "rgba(20,20,20,0.82)" }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3">
        <span className="block">{message}</span>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center ">
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                className="rounded-full bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-900 transition-opacity hover:opacity-90 active:opacity-80"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        className="absolute right-3 top-3 flex size-7 justify-center rounded-full text-white/60 transition-colors hover:text-white/90 active:text-white"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
