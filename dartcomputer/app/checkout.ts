/**
 * Working out how to take a score out. The board is generated rather than
 * tabulated, and the routes are ranked by what a player would rather throw,
 * since most scores can be finished several ways.
 */

import {
  BULLSEYE,
  DARTS_PER_TURN,
  MAX_DART_SCORE,
  isCheckoutPossible,
} from "./darts";

/** A single dart, as a player would call it out. */
export type Throw = {
  label: string;
  value: number;
  kind: "single" | "double" | "treble";
};

const SEGMENTS = Array.from({ length: 20 }, (_, index) => index + 1);

/** Every dart on the board, both bulls included. */
const BOARD: Throw[] = [
  ...SEGMENTS.map((segment): Throw => ({
    label: String(segment),
    value: segment,
    kind: "single",
  })),
  ...SEGMENTS.map((segment): Throw => ({
    label: `D${segment}`,
    value: segment * 2,
    kind: "double",
  })),
  ...SEGMENTS.map((segment): Throw => ({
    label: `T${segment}`,
    value: segment * 3,
    kind: "treble",
  })),
  { label: "25", value: 25, kind: "single" },
  { label: "Bull", value: BULLSEYE, kind: "double" },
];

/**
 * Doubles in the order players like to be left on them, best first: D20 and
 * D16 halve cleanly on a miss, the odd ones leave an awkward number.
 */
const DOUBLE_PREFERENCE = [40, 32, 24, 20, 16, 36, 28, 12, 8, 4];

/** How much a double is worth avoiding as the dart that finishes the leg. */
function finishCost(dart: Throw): number {
  const preferred = DOUBLE_PREFERENCE.indexOf(dart.value);
  if (preferred !== -1) return preferred;
  // The bull is a double, but a small one to have to hit.
  if (dart.value === BULLSEYE) return DOUBLE_PREFERENCE.length;
  return DOUBLE_PREFERENCE.length + 2;
}

/** How awkward a dart is as a setup, with the trebles ranked from T20 down. */
function setupCost(dart: Throw): number {
  // Nobody aims at a double to set another one up, and both bulls are small.
  if (dart.kind === "double") return 10;
  if (dart.value === 25) return 5;
  // Trebles rank from T20 down: one point of cost per segment away from it.
  if (dart.kind === "treble") return (MAX_DART_SCORE - dart.value) / 3;
  return 2;
}

/** The cheapest way to throw each value, which is all a setup dart needs. */
const SETUP_BY_VALUE = new Map<number, Throw>();
for (const dart of BOARD) {
  const cheapest = SETUP_BY_VALUE.get(dart.value);
  if (cheapest === undefined || setupCost(dart) < setupCost(cheapest)) {
    SETUP_BY_VALUE.set(dart.value, dart);
  }
}
const SETUP_THROWS = [...SETUP_BY_VALUE.values()];
const FINISHES = BOARD.filter((dart) => dart.kind === "double");

/** A dart saved beats any preference, so darts dominate the cost. */
const DART_COST = 1000;

type Route = { darts: Throw[]; cost: number };

const cheaper = (best: Route | null, candidate: Route): Route => {
  if (best === null || candidate.cost < best.cost) return candidate;
  if (candidate.cost > best.cost) return best;
  // Level on paper, so open with the bigger dart: it is the one being aimed
  // at anyway, and it leaves the smaller dart for the tidying up.
  return candidate.darts[0].value > best.darts[0].value ? candidate : best;
};

/** Setups are thrown biggest first, whichever order the search found them in. */
const routeOf = (setups: Throw[], finish: Throw): Route => ({
  darts: [...[...setups].sort((a, b) => b.value - a.value), finish],
  cost:
    (setups.length + 1) * DART_COST +
    setups.reduce((total, dart) => total + setupCost(dart), 0) +
    finishCost(finish),
});

/**
 * The way to take a score out that a player would most like to be given: the
 * fewest darts, then the friendliest double, then the most natural setup.
 * Returns null when the score cannot be finished with the darts left.
 */
export function checkoutRoute(
  score: number,
  dartsLeft: number = DARTS_PER_TURN,
): Throw[] | null {
  if (dartsLeft < 1 || !isCheckoutPossible(score)) return null;

  let best: Route | null = null;

  for (const finish of FINISHES) {
    const toSetUp = score - finish.value;
    if (toSetUp < 0) continue;

    // Straight at the double.
    if (toSetUp === 0) {
      best = cheaper(best, routeOf([], finish));
      continue;
    }
    if (dartsLeft < 2) continue;

    // One dart to set the double up.
    const setup = SETUP_BY_VALUE.get(toSetUp);
    if (setup !== undefined) best = cheaper(best, routeOf([setup], finish));
    if (dartsLeft < 3) continue;

    // Two darts to set it up; the cheapest throw per value is enough here.
    for (const first of SETUP_THROWS) {
      const second = SETUP_BY_VALUE.get(toSetUp - first.value);
      if (second === undefined) continue;
      best = cheaper(best, routeOf([first, second], finish));
    }
  }

  return best === null ? null : best.darts;
}
