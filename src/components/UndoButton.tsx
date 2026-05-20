import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
} from "react";
import { isUndoVisible, type Action, type GameState } from "../app/state";
import { vibrateUndo } from "../adapters/vibration";

interface Props {
  state: GameState;
  dispatch: Dispatch<Action>;
  label: string;
  holdLabel: string;
}

const HOLD_MS = 700;
const MOVE_CANCEL_PX = 12;

export function UndoButton({ state, dispatch, label }: Props) {
  const visible = isUndoVisible(state);
  const [holding, setHolding] = useState(false);

  const cancelSignal = useMemo(
    () =>
      `${state.scores.red}-${state.scores.blue}-${state.history.length}-${state.settingsOpen}-${state.deadlock}-${state.invalidTargetLock}-${state.winnerOverlayVisible}-${state.pendingNewSet}`,
    [
      state.scores.red,
      state.scores.blue,
      state.history.length,
      state.settingsOpen,
      state.deadlock,
      state.invalidTargetLock,
      state.winnerOverlayVisible,
      state.pendingNewSet,
    ],
  );

  const holdRef = useRef<{
    pointerId: number;
    raf: number;
    startX: number;
    startY: number;
  } | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const circumference = 2 * Math.PI * 16;

  const cancelHold = useCallback(() => {
    if (!holdRef.current) return;
    cancelAnimationFrame(holdRef.current.raf);
    holdRef.current = null;
    setHolding(false);
    if (ringRef.current)
      ringRef.current.style.strokeDashoffset = `${circumference}`;
  }, [circumference]);

  useEffect(() => {
    cancelHold();
  }, [cancelSignal, cancelHold]);

  useEffect(() => cancelHold, [cancelHold]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
      <button
        type="button"
        aria-label={label}
        className={[
          "pointer-events-auto",
          "select-none touch-manipulation",
          "relative",
          "inline-flex flex-col items-center justify-center gap-1",
          "min-h-12 rounded-full px-4 py-2",
          "bg-zinc-950/55 text-white ring-1 ring-white/15 backdrop-blur-md",
          "text-[12px] font-semibold uppercase tracking-[0.18em]",
          "shadow-[0_12px_28px_rgba(0,0,0,0.35)]",
          "transition-[transform,box-shadow,background-color] duration-150",
          "active:scale-[0.98] active:shadow-[0_8px_18px_rgba(0,0,0,0.32)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        ].join(" ")}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (holdRef.current) return;

          const btn = e.currentTarget;
          btn.setPointerCapture?.(e.pointerId);

          setHolding(true);
          const startT = performance.now();
          const startX = e.clientX;
          const startY = e.clientY;

          const tick = (now: number) => {
            if (!holdRef.current) return;
            const progress = Math.min((now - startT) / HOLD_MS, 1);
            if (ringRef.current)
              ringRef.current.style.strokeDashoffset = `${circumference * (1 - progress)}`;
            if (progress >= 1) {
              holdRef.current = null;
              setHolding(false);
              vibrateUndo();
              dispatch({ type: "UNDO" });
              return;
            }
            holdRef.current.raf = requestAnimationFrame(tick);
          };

          holdRef.current = {
            pointerId: e.pointerId,
            raf: requestAnimationFrame(tick),
            startX,
            startY,
          };
        }}
        onPointerMove={(e) => {
          if (!holdRef.current) return;
          if (e.pointerId !== holdRef.current.pointerId) return;
          const dx = e.clientX - holdRef.current.startX;
          const dy = e.clientY - holdRef.current.startY;
          if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) cancelHold();
        }}
        onPointerUp={(e) => {
          if (holdRef.current?.pointerId === e.pointerId) cancelHold();
        }}
        onPointerCancel={(e) => {
          if (holdRef.current?.pointerId === e.pointerId) cancelHold();
        }}
        onLostPointerCapture={cancelHold}
      >
        <UndoIcon className="h-4 w-4" />

        {holding ? (
          <svg
            className="pointer-events-none absolute"
            width="44"
            height="44"
            viewBox="0 0 44 44"
            aria-hidden
          >
            <circle
              ref={ringRef}
              cx="22"
              cy="22"
              r="16"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
            />
          </svg>
        ) : null}
      </button>
    </div>
  );
}

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
