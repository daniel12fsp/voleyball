interface Props {
  label: string;
  score: number;
  showSetPoint: boolean;
  setPointText: string;
}

export function ScoreTeamButton({
  label,
  score,
  showSetPoint,
  setPointText,
}: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 pb-6">
      <span className="text-[clamp(0.9rem,4.2vw,2.4rem)] font-extrabold tracking-[0.28em] opacity-90">
        {label}
      </span>
      <span className="score-text relative w-full">
        {score}
        {showSetPoint && <LabelSetPoint setPointText={setPointText} />}
      </span>
    </div>
  );
}

function LabelSetPoint({ setPointText }: { setPointText: string }) {
  return (
    <span className="absolute -bottom-[30px] inset-x-0 m-auto">
      <span className="pointer-events-none rounded-full bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 top-0">
        {setPointText}
      </span>
    </span>
  );
}
