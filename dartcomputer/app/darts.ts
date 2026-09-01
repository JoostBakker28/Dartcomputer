/**
 * Scoring a leg of 501: what a dart can be worth, what a turn does to the
 * score, and how a turn ends. Everything here is about a single leg; the
 * match built out of legs lives in match-rules.ts.
 */

export const DARTS_PER_TURN = 3;
export const MAX_DART_SCORE = 60;
/** Three treble twenties: the most that can be scored in one turn. */
export const MAXIMUM_SCORE = DARTS_PER_TURN * MAX_DART_SCORE;
/** Scores no single dart can make, so they are impossible to enter. */
export const IMPOSSIBLE_SCORES = [
  59, 58, 56, 55, 53, 52, 49, 47, 46, 44, 43, 41, 37, 35, 31, 29, 23,
];
export const STARTING_SCORE = 501;
/** Highest score that can still be checked out: T20, T20, bullseye. */
export const MAX_CHECKOUT = 170;
/** Scores inside that range which still cannot be finished in three darts. */
export const BOGEY_SCORES = [169, 168, 166, 165, 163, 162, 159];
/** Highest double on the board, D20. */
export const MAX_DOUBLE = 40;
/** The inner bull, which counts as a double for checkout purposes. */
export const BULLSEYE = 50;

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
  /** Turns of the legs already finished, kept for the match statistics. */
  legsPlayed: Turn[][];
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
    legsPlayed: [],
    legs: 0,
    sets: 0,
  };
}

/** Clears the throwing state for the next leg, keeping the match score. */
export function startLeg(player: Player): Player {
  return {
    ...player,
    darts: emptyDarts(),
    history: [],
    legsPlayed: [...player.legsPlayed, player.history],
  };
}

/** How many of the three darts have a score in them. */
export function dartsEntered(darts: string[]): number {
  return darts.filter((dart) => dart !== "").length;
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
    value.length === 2 ||
    value === "0" ||
    IMPOSSIBLE_SCORES.includes(Number(value)) ||
    Number(`${value}0`) > MAX_DART_SCORE
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
 * Whether a checkout is on at all: within range of three darts, and not one of
 * the scores in that range that no combination can finish.
 */
export function isCheckoutPossible(score: number): boolean {
  return score >= 2 && score <= MAX_CHECKOUT && !BOGEY_SCORES.includes(score);
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
