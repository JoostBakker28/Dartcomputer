export const DARTS_PER_TURN = 3;
export const MAX_DART_SCORE = 60;
export const IMPOSSIBLE_SCORES = [59, 58, 56, 55, 53, 52, 49, 47, 46, 44, 43, 41, 37, 35, 31, 29, 23];
export const STARTING_SCORE = 501;
/** Highest score that can still be checked out: T20, T20, bullseye. */
export const MAX_CHECKOUT = 170;

export type Turn = {
  darts: string[];
  /** Whether the final dart of the turn was a double, for checkout. */
  isDouble: boolean;
  /** False when recorded via "No score" — the player missed or busted. */
  scored: boolean;
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

/** Points thrown in a turn. A turn recorded as "No score" is always worth 0. */
export function turnTotal(turn: Turn): number {
  if (!turn.scored) return 0;
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
