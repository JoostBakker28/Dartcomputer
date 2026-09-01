export const DARTS_PER_TURN = 3;
export const MAX_DART_SCORE = 60;
/** Scores that cannot be achieved with a single dart, so they are impossible to enter. */
export const IMPOSSIBLE_SCORES = [59, 58, 56, 55, 53, 52, 49, 47, 46, 44, 43, 41, 37, 35, 31, 29, 23];
export const STARTING_SCORE = 501;
/** Highest score that can still be checked out: T20, T20, bullseye. */
export const MAX_CHECKOUT = 170;
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
  /** Whether the final dart of the turn was a double, for checkout. */
  isDouble: boolean;
  outcome: TurnOutcome;
};

export type Player = {
  name: string;
  /** Scores for the turn currently being entered, one string per dart. */
  darts: string[];
  /** Double flag for the turn currently being entered. */
  isDouble: boolean;
  /** Completed turns, oldest first. */
  history: Turn[];
};

export function createPlayer(name: string): Player {
  return {
    name,
    darts: Array<string>(DARTS_PER_TURN).fill(""),
    isDouble: false,
    history: [],
  };
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

/** Whether this player is close enough to finish the leg on a double. */
export function canCheckout(player: Player): boolean {
  return liveRemainingScore(player) <= MAX_CHECKOUT;
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
 * A checkout counts only when the turn lands exactly on zero, the player
 * confirmed the final dart was a double, and that dart really is one.
 */
export function isValidCheckout(player: Player): boolean {
  if (!player.isDouble) return false;
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

/** The player who has finished the leg, if there is one. */
export function findWinner(players: Player[]): number | null {
  const index = players.findIndex((player) =>
    player.history.some((turn) => turn.outcome === "checkout"),
  );
  return index === -1 ? null : index;
}
