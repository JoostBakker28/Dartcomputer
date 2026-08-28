export const DARTS_PER_TURN = 3;
export const MAX_DART_SCORE = 60;
export const IMPOSSIBLE_SCORES = [59, 58, 56, 55, 53, 52, 49, 47, 46, 44, 43, 41, 37, 35, 31, 29, 23];

export type Player = {
  name: string;
  /** Scores for the turn currently being entered, one string per dart. */
  darts: string[];
  /** Completed turns, oldest first. */
  history: string[][];
};

export function createPlayer(name: string): Player {
  return {
    name,
    darts: Array<string>(DARTS_PER_TURN).fill(""),
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
