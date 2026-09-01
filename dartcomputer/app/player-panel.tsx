import type { KeyboardEvent } from "react";

import {
  DARTS_PER_TURN,
  remainingScore,
  turnTotal,
  type Player,
  type TurnOutcome,
} from "./darts";

/** Badge shown next to a completed turn; a plain scoring turn gets none. */
const OUTCOME_BADGES: Record<
  TurnOutcome,
  { label: string; className: string } | null
> = {
  scored: null,
  checkout: {
    label: "Checkout",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  bust: {
    label: "Bust",
    className: "bg-red-500/15 text-red-700 dark:text-red-400",
  },
  "no-score": {
    label: "No score",
    className: "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300",
  },
};

type PlayerPanelProps = {
  player: Player;
  name: string;
  isActive: boolean;
  canSubmit: boolean;
  /** Sets are only worth showing when the match is played in them. */
  showSets: boolean;
  onNameChange: (name: string) => void;
  onDartChange: (dartIndex: number, value: string) => void;
  onDartKeyDown: (
    dartIndex: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => void;
  onSubmitTurn: () => void;
  onNoScore: () => void;
  registerDartRef: (
    dartIndex: number,
    element: HTMLInputElement | null,
  ) => void;
};

export default function PlayerPanel({
  player,
  name,
  isActive,
  canSubmit,
  showSets,
  onNameChange,
  onDartChange,
  onDartKeyDown,
  onSubmitTurn,
  onNoScore,
  registerDartRef,
}: PlayerPanelProps) {
  return (
    <section
      aria-label={name}
      className={`flex flex-col gap-6 rounded-2xl border p-6 transition-colors ${
        isActive
          ? "border-emerald-500 bg-white shadow-lg shadow-emerald-500/10 dark:bg-zinc-900"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      <header className="flex items-center justify-between gap-3">
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          aria-label="Player name"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-lg font-semibold tracking-tight text-zinc-900 hover:border-zinc-300 focus:border-emerald-500 focus:outline-none dark:text-zinc-50 dark:hover:border-zinc-700"
        />
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            isActive
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "text-zinc-400 dark:text-zinc-600"
          }`}
        >
          {isActive ? "Your turn" : "Waiting"}
        </span>
      </header>

      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-6xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
          {remainingScore(player)}
        </p>
        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <span>
            Legs{" "}
            <span className="font-mono text-sm text-zinc-900 dark:text-zinc-50">
              {player.legs}
            </span>
          </span>
          {showSets && (
            <span>
              Sets{" "}
              <span className="font-mono text-sm text-zinc-900 dark:text-zinc-50">
                {player.sets}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {player.darts.map((dart, dartIndex) => (
          <label key={dartIndex} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Dart {dartIndex + 1}
            </span>
            <input
              ref={(element) => {
                registerDartRef(dartIndex, element);
              }}
              value={dart}
              onChange={(event) => onDartChange(dartIndex, event.target.value)}
              onKeyDown={(event) => onDartKeyDown(dartIndex, event)}
              onFocus={(event) => event.target.select()}
              disabled={!isActive}
              inputMode="numeric"
              autoComplete="off"
              placeholder="–"
              className="w-full rounded-lg border border-zinc-300 bg-white py-3 text-center font-mono text-2xl tabular-nums text-zinc-900 placeholder:text-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-700 dark:disabled:bg-zinc-900/50"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onSubmitTurn}
          disabled={!isActive || !canSubmit}
          className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
        >
          Submit turn
        </button>
        <button
          type="button"
          onClick={onNoScore}
          disabled={!isActive}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:disabled:text-zinc-700"
        >
          No score
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Turns
        </h2>
        {player.history.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No turns entered yet.
          </p>
        ) : (
          <ol className="flex flex-col gap-1">
            {player.history.map((turn, turnIndex) => {
              const badge = OUTCOME_BADGES[turn.outcome];
              return (
                <li
                  key={turnIndex}
                  className="flex items-center gap-3 rounded-md bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800/60"
                >
                  <span className="w-14 shrink-0 text-zinc-500 dark:text-zinc-400">
                    Turn {turnIndex + 1}
                  </span>
                  <span className="flex-1 font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                    {Array.from({ length: DARTS_PER_TURN }, (_, dartIndex) =>
                      turn.darts[dartIndex] === ""
                        ? "–"
                        : turn.darts[dartIndex],
                    ).join("  ·  ")}
                  </span>
                  {badge && (
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}
                  <span className="w-8 shrink-0 text-right font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {turnTotal(turn)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
