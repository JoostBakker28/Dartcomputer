export const DARTS_PER_TURN = 3;
export const MAX_DART_SCORE = 60;
/** Scores that cannot be achieved with a single dart, so they are impossible to enter. */
export const IMPOSSIBLE_SCORES = [59, 58, 56, 55, 53, 52, 49, 47, 46, 44, 43, 41, 37, 35, 31, 29, 23];
export const STARTING_SCORE = 501;
/** Highest double on the board, D20. */
export const MAX_DOUBLE = 40;
/** The inner bull, which counts as a double for checkout purposes. */
export const BULLSEYE = 50;
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

export type TurnOutcome =
  /** A normal scoring turn. */
  | "scored"
  /** Won the leg on a double. */
  | "checkout"
  /** Went below zero, landed on one, or finished without a valid double. */
  | "bust"
  /** Recorded manually with the "No score" button. */
  | "no-score";

export type Turn = {
  darts: string[];
  outcome: TurnOutcome;
};

export type Player = {
  /** Scores for the turn currently being entered, one string per dart. */
  darts: string[];
  /** Completed turns of the current leg, oldest first. */
  history: Turn[];
  /** Legs won: in the current set when playing sets, in the match otherwise. */
  legs: number;
  /** Sets won; stays at zero when playing legs. */
  sets: number;
};

/** A fresh set of empty darts for a turn that has not been thrown yet. */
export function emptyDarts(): string[] {
  return Array<string>(DARTS_PER_TURN).fill("");
}

export function createPlayer(): Player {
  return {
    darts: emptyDarts(),
    history: [],
    legs: 0,
    sets: 0,
  };
}

/** Clears the throwing state for the next leg, keeping the match score. */
export function startLeg(player: Player): Player {
  return { ...player, darts: emptyDarts(), history: [] };
}

/** Strips anything that is not a digit and keeps the value within 0-60. */
export function sanitizeDartInput(rawValue: string): string | null {
  const digits = rawValue.replace(/\D/g, "").slice(0, 2);
  if (IMPOSSIBLE_SCORES.includes(Number(digits))) return null;
  if (digits !== "" && Number(digits) > MAX_DART_SCORE) return null;
  return digits;
}

/**
 * True when no further digit could extend this value into a valid dart score,
 * which is the moment we can safely jump to the next dart field.
 */
export function isDartComplete(value: string): boolean {
  if (value === "") return false;
  return (
    IMPOSSIBLE_SCORES.includes(Number(value)) || value.length === 2 || value === "0" || Number(`${value}0`) > MAX_DART_SCORE
  );
}

/** Only a turn that actually counted puts points on the board. */
export function turnTotal(turn: Turn): number {
  if (turn.outcome === "bust" || turn.outcome === "no-score") return 0;
  return turn.darts.reduce(
    (total, dart) => total + (dart === "" ? 0 : Number(dart)),
    0,
  );
}

/** What the player has left after every turn they have submitted so far. */
export function remainingScore(player: Player): number {
  return player.history.reduce(
    (remaining, turn) => remaining - turnTotal(turn),
    STARTING_SCORE,
  );
}

/** Points entered so far in the turn currently in progress. */
export function currentTurnTotal(player: Player): number {
  return player.darts.reduce(
    (total, dart) => total + (dart === "" ? 0 : Number(dart)),
    0,
  );
}

/**
 * Score left including the darts already entered this turn, so a checkout that
 * comes into range mid-turn is recognised straight away.
 */
export function liveRemainingScore(player: Player): number {
  return remainingScore(player) - currentTurnTotal(player);
}

/**
 * A leg must end on a double: any even score from 2 to 40 (D1-D20), or the
 * bullseye, which is scored as a double 25.
 */
export function isCheckoutDouble(score: number): boolean {
  if (score === BULLSEYE) return true;
  return score >= 2 && score <= MAX_DOUBLE && score % 2 === 0;
}

/**
 * The last dart actually thrown this turn. A leg can be checked out on the
 * first or second dart, so this is not always dart three.
 */
export function finalDartScore(darts: string[]): number | null {
  for (let index = darts.length - 1; index >= 0; index -= 1) {
    if (darts[index] !== "") return Number(darts[index]);
  }
  return null;
}

/**
 * A checkout counts when the turn lands exactly on zero and the final dart is
 * a score that can be thrown as a double. Whether it really was one is left to
 * the players.
 */
export function isValidCheckout(player: Player): boolean {
  if (liveRemainingScore(player) !== 0) return false;

  const finalDart = finalDartScore(player.darts);
  return finalDart !== null && isCheckoutDouble(finalDart);
}

/**
 * Classifies the turn in progress. Landing below zero or on exactly one is a
 * bust, as is reaching zero without a valid double to finish on.
 */
export function turnOutcome(player: Player): TurnOutcome {
  const live = liveRemainingScore(player);
  if (live === 0) return isValidCheckout(player) ? "checkout" : "bust";
  if (live < 0 || live === 1) return "bust";
  return "scored";
}

/** The player who has checked out in the leg being played, if there is one. */
export function findLegWinner(players: Player[]): number | null {
  const index = players.findIndex((player) =>
    player.history.some((turn) => turn.outcome === "checkout"),
  );
  return index === -1 ? null : index;
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
  const index = players.findIndex(
    (player) => (settings.format === "sets" ? player.sets : player.legs) >= target,
  );
  return index === -1 ? null : index;
}
