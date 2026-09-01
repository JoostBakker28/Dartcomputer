"use client";

import {
  LEGS_PER_SET,
  MAX_LEGS,
  MAX_SETS,
  bestOf,
  bestOfLabel,
  bestOfOptions,
  winsNeeded,
  type MatchFormat,
  type MatchSettings,
} from "./match-rules";

const FORMAT_CHOICES: { value: MatchFormat; label: string; hint: string }[] = [
  { value: "legs", label: "Play legs", hint: "Straight race to the finish" },
  { value: "sets", label: "Play sets", hint: `Each set is best of ${LEGS_PER_SET} legs` },
];

/** Spells out what the chosen length actually means for the match. */
function describeLength(settings: MatchSettings): string {
  const wins = winsNeeded(bestOf(settings));
  const legsPerSet = winsNeeded(LEGS_PER_SET);

  if (settings.format === "sets") {
    const target =
      wins === 1 ? "A single set decides the match" : `First to ${wins} sets`;
    return `${target}. Every set is a best of ${LEGS_PER_SET} legs, so ${legsPerSet} legs take a set.`;
  }

  return wins === 1
    ? "A single leg decides the match."
    : `First to ${wins} legs wins the match.`;
}

type MatchSetupProps = {
  names: string[];
  settings: MatchSettings;
  onNamesChange: (names: string[]) => void;
  onSettingsChange: (settings: MatchSettings) => void;
  onStart: () => void;
};

export default function MatchSetup({
  names,
  settings,
  onNamesChange,
  onSettingsChange,
  onStart,
}: MatchSetupProps) {
  const playingSets = settings.format === "sets";
  const lengthOptions = bestOfOptions(playingSets ? MAX_SETS : MAX_LEGS);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onStart();
      }}
      className="flex w-full flex-col gap-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
    >
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Match setup
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Names can still be changed once the match is under way.
        </p>
      </header>

      <fieldset className="flex flex-col gap-3">
        <legend className="pb-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Players
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {names.map((name, playerIndex) => (
            <label key={playerIndex} className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Player {playerIndex + 1}
              </span>
              <input
                value={name}
                onChange={(event) =>
                  onNamesChange(
                    names.map((current, index) =>
                      index === playerIndex ? event.target.value : current,
                    ),
                  )
                }
                placeholder={`Player ${playerIndex + 1}`}
                autoComplete="off"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="pb-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Format
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {FORMAT_CHOICES.map((choice) => {
            const selected = settings.format === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onSettingsChange({ ...settings, format: choice.value })
                }
                className={`flex flex-col gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    selected
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  {choice.label}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {choice.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {playingSets ? "Sets" : "Legs"}
          </span>
          <select
            value={bestOf(settings)}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                [playingSets ? "sets" : "legs"]: Number(event.target.value),
              })
            }
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {lengthOptions.map((count) => (
              <option key={count} value={count}>
                {bestOfLabel(count, settings.format)}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {describeLength(settings)}
        </p>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        Start match
      </button>
    </form>
  );
}
