import type { Dispatch } from "react";
import { getSetPoint, type Action, type GameState } from "../app/state";
import { ScoreTeamButton } from "./ScoreTeamButton";

interface Props {
  state: GameState;
  dispatch: Dispatch<Action>;
  tx: {
    setPoint: string;
    red: string;
    blue: string;
  };
}

export function ScoreBoard({ state, dispatch, tx }: Props) {
  const { scores } = state;
  const redSetPoint = getSetPoint(state, "red");
  const blueSetPoint = getSetPoint(state, "blue");

  return (
    <main
      className="fixed inset-0 flex flex-col landscape:flex-row md:flex-row"
      aria-label="Volleyball scoreboard"
    >
      <button
        type="button"
        className="score-zone relative flex-1 bg-redTeam text-white"
        style={{ ["--score-glow" as never]: "rgba(229,57,53,0.55)" }}
        onPointerDown={(e) => {
          e.preventDefault();
          dispatch({ type: "SCORE_TAP", team: "red" });
        }}
        aria-label={`${tx.red}: ${scores.red}`}
      >
        <ScoreTeamButton
          label={tx.red}
          score={scores.red}
          showSetPoint={redSetPoint}
          setPointText={tx.setPoint}
        />
      </button>

      <div className="pointer-events-none h-3 w-full bg-black/45 md:w-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.35)] landscape:h-full landscape:w-3" />

      <button
        type="button"
        className="score-zone relative flex-1 bg-blueTeam text-white"
        style={{ ["--score-glow" as never]: "rgba(30,136,229,0.55)" }}
        onPointerDown={(e) => {
          e.preventDefault();
          dispatch({ type: "SCORE_TAP", team: "blue" });
        }}
        aria-label={`${tx.blue}: ${scores.blue}`}
      >
        <ScoreTeamButton
          label={tx.blue}
          score={scores.blue}
          showSetPoint={blueSetPoint}
          setPointText={tx.setPoint}
        />
      </button>
    </main>
  );
}
