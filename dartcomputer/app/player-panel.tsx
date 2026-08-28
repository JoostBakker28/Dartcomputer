import type { KeyboardEvent } from "react";

import { DARTS_PER_TURN, type Player } from "./darts";

type PlayerPanelProps = {
  player: Player;
  isActive: boolean;
  canSubmit: boolean;
  onNameChange: (name: string) => void;
  onDartChange: (dartIndex: number, value: string) => void;
  onDartKeyDown: (
    dartIndex: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => void;
  onSubmitTurn: () => void;
  registerDartRef: (
    dartIndex: number,
    element: HTMLInputElement | null,
  ) => void;
};

export default function PlayerPanel({
  player,
  isActive,
  canSubmit,
  onNameChange,
  onDartChange,
  onDartKeyDown,
  onSubmitTurn,
  registerDartRef,
}: PlayerPanelProps) {
  return (
    <section
      aria-label={player.name}
      className={`flex flex-col gap-6 rounded-2xl border p-6 transition-colors ${
        isActive
          ? "border-emerald-500 bg-white shadow-lg shadow-emerald-500/10 dark:bg-zinc-900"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      <header className="flex items-center justify-between gap-3">
        <input
          value={player.name}
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

      <p className="text-center font-mono text-6xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
        501
      </p>

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

      <button
        type="button"
        onClick={onSubmitTurn}
        disabled={!isActive || !canSubmit}
        className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
      >
        Submit turn
      </button>

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
            {player.history.map((turn, turnIndex) => (
              <li
                key={turnIndex}
                className="flex items-center justify-between rounded-md bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800/60"
              >
                <span className="text-zinc-500 dark:text-zinc-400">
                  Turn {turnIndex + 1}
                </span>
                <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                  {Array.from({ length: DARTS_PER_TURN }, (_, dartIndex) =>
                    turn[dartIndex] === "" ? "–" : turn[dartIndex],
                  ).join("  ·  ")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
