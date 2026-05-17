import type { Dispatch } from "react";
import { type Action } from "../app/state";

interface Props {
  dispatch: Dispatch<Action>;
  setToText: string;
  settingsLabel: string;
}

export function TopBar({ dispatch, setToText, settingsLabel }: Props) {
  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-30"
      style={{ height: `calc(env(safe-area-inset-top) + var(--topbar-h))` }}
    >
      <div className="flex h-full items-end" style={{ paddingTop: `env(safe-area-inset-top)` }}>
        <div className="h-[var(--topbar-h)] w-full bg-black/70 backdrop-blur-md shadow-[0_8px_22px_rgba(0,0,0,0.35)]">
          <div className="pointer-events-none mx-auto flex h-full max-w-5xl items-center justify-between gap-3 px-3">
            <span className="pointer-events-none rounded-md bg-[#D4AF37] px-3 py-1 text-[11px] font-black italic tracking-wide text-black shadow-[0_2px_0_rgba(0,0,0,0.35)]">
              {setToText}
            </span>

            <button
              type="button"
              className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white ring-1 ring-white/15"
              onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
              aria-label={settingsLabel}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
