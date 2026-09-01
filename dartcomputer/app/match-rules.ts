/**
 * The match built out of legs: the format chosen on the setup screen, and how
 * a won leg turns into a won set and eventually a won match.
 */

import type { Player } from "./darts";

/** Longest match the setup screen offers when playing legs. */
export const MAX_LEGS = 31;
/** Longest match the setup screen offers when playing sets. */
export const MAX_SETS = 13;
/** Every set is played as a best of five legs, so three legs take one. */
export const LEGS_PER_SET = 5;

export type MatchFormat = "legs" | "sets";

/**
 * The rules chosen on the setup screen. Both counts are kept so switching
 * format and back does not lose the length picked for the other one.
 */
export type MatchSettings = {
  format: MatchFormat;
  /** Best-of leg count, used when playing legs. Always odd. */
  legs: number;
  /** Best-of set count, used when playing sets. Always odd. */
  sets: number;
};

export const DEFAULT_SETTINGS: MatchSettings = {
  format: "legs",
  legs: 1,
  sets: 5,
};

/** How many legs, or sets, the match is a best of, given the chosen format. */
export function bestOf(settings: MatchSettings): number {
  return settings.format === "sets" ? settings.sets : settings.legs;
}

/** The odd best-of counts up to a limit, which is what the dropdowns offer. */
export function bestOfOptions(max: number): number[] {
  const options: number[] = [];
  for (let count = 1; count <= max; count += 2) options.push(count);
  return options;
}

/** A best of five is taken by three: the majority of the count. */
export function winsNeeded(count: number): number {
  return Math.ceil(count / 2);
}

/** Short description of a match length, such as "Best of 5 sets". */
export function bestOfLabel(count: number, format: MatchFormat): string {
  const unit = format === "sets" ? "set" : "leg";
  return `Best of ${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** The same label for the rules as they are currently set. */
export function formatSummary(settings: MatchSettings): string {
  return bestOfLabel(bestOf(settings), settings.format);
}

/**
 * Credits a won leg and, when playing sets, rolls it up into a set as soon as
 * the winner has taken the majority of the legs in it.
 */
export function awardLeg(
  players: Player[],
  winnerIndex: number,
  settings: MatchSettings,
): Player[] {
  const credited = players.map((player, index) =>
    index === winnerIndex ? { ...player, legs: player.legs + 1 } : player,
  );

  if (settings.format !== "sets") return credited;
  if (credited[winnerIndex].legs < winsNeeded(LEGS_PER_SET)) return credited;

  // The set is decided, so the leg score starts again for both players.
  return credited.map((player, index) => ({
    ...player,
    legs: 0,
    sets: index === winnerIndex ? player.sets + 1 : player.sets,
  }));
}

/** Whether the leg just won also took a set, which the banner spells out. */
export function wonSet(
  players: Player[],
  winnerIndex: number,
  settings: MatchSettings,
): boolean {
  // Winning a leg always leaves one on the board unless a set cleared them.
  return settings.format === "sets" && players[winnerIndex].legs === 0;
}

/** The player who has taken the whole match, if the format has been reached. */
export function findMatchWinner(
  players: Player[],
  settings: MatchSettings,
): number | null {
  const target = winsNeeded(bestOf(settings));
  const index = players.findIndex((player) =>
    settings.format === "sets" ? player.sets >= target : player.legs >= target,
  );
  return index === -1 ? null : index;
}
