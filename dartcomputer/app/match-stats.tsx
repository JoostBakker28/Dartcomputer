import { playerStats, type Player, type PlayerStats } from "./darts";

type StatRow = {
  label: string;
  /** The figure itself, plus the raw counts behind it where they help. */
  read: (stats: PlayerStats) => { value: string; hint?: string };
};

const ROWS: StatRow[] = [
  {
    label: "3-dart average",
    read: (stats) => ({
      value: stats.average === null ? "–" : stats.average.toFixed(2),
    }),
  },
  { label: "Best turn", read: (stats) => ({ value: String(stats.bestTurn) }) },
  { label: "Turns thrown", read: (stats) => ({ value: String(stats.turns) }) },
  {
    label: "Checkout %",
    read: (stats) => ({
      value:
        stats.checkoutChances === 0
          ? "–"
          : `${Math.round((stats.checkouts / stats.checkoutChances) * 100)}%`,
      hint: `${stats.checkouts} of ${stats.checkoutChances}`,
    }),
  },
];

type MatchStatsProps = {
  names: string[];
  players: Player[];
};

export default function MatchStats({ names, players }: MatchStatsProps) {
  const stats = players.map(playerStats);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Match statistics
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="w-1/3 pb-2 text-left font-medium text-zinc-400 dark:text-zinc-500">
                Over the whole match
              </th>
              {names.map((name, playerIndex) => (
                <th
                  key={playerIndex}
                  className="pb-2 text-right font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.label}
                className="border-t border-zinc-100 dark:border-zinc-800"
              >
                <td className="py-2.5 text-zinc-500 dark:text-zinc-400">
                  {row.label}
                </td>
                {stats.map((playerStat, playerIndex) => {
                  const cell = row.read(playerStat);
                  return (
                    <td
                      key={playerIndex}
                      className="py-2.5 text-right font-mono text-base tabular-nums text-zinc-900 dark:text-zinc-50"
                    >
                      {cell.value}
                      {cell.hint && (
                        <span className="ml-2 font-sans text-xs text-zinc-400 dark:text-zinc-500">
                          {cell.hint}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
