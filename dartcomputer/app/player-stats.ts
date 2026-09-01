/**
 * What a player has to show for the match once it is over. The figures are
 * derived from the recorded turns, so nothing has to be tracked as it is
 * played.
 */

import {
  DARTS_PER_TURN,
  STARTING_SCORE,
  dartsEntered,
  isCheckoutPossible,
  turnTotal,
  type Player,
  type Turn,
} from "./darts";

export type PlayerStats = {
  /** Points per three darts, or null before a single dart is thrown. */
  average: number | null;
  /** Most points put away in one turn. */
  bestTurn: number;
  turns: number;
  /** Legs finished off. */
  checkouts: number;
  /** Turns started on a score a checkout was actually possible from. */
  checkoutChances: number;
};

/** Darts thrown in a turn. A "no score" turn is taken as a full three. */
export function dartsThrown(turn: Turn): number {
  if (turn.outcome === "no-score") return DARTS_PER_TURN;
  return dartsEntered(turn.darts);
}

/** Every leg of the match, the one on the board included. */
export function matchLegs(player: Player): Turn[][] {
  return [...player.legsPlayed, player.history];
}

/**
 * Walks the match leg by leg, since a checkout chance depends on the score
 * left at the start of each turn.
 */
export function playerStats(player: Player): PlayerStats {
  const stats: PlayerStats = {
    average: null,
    bestTurn: 0,
    turns: 0,
    checkouts: 0,
    checkoutChances: 0,
  };
  let points = 0;
  let darts = 0;

  for (const leg of matchLegs(player)) {
    let remaining = STARTING_SCORE;
    for (const turn of leg) {
      const total = turnTotal(turn);

      if (isCheckoutPossible(remaining)) stats.checkoutChances += 1;
      if (turn.outcome === "checkout") stats.checkouts += 1;
      stats.bestTurn = Math.max(stats.bestTurn, total);
      stats.turns += 1;
      points += total;
      darts += dartsThrown(turn);
      remaining -= total;
    }
  }

  if (darts > 0) stats.average = (points / darts) * DARTS_PER_TURN;
  return stats;
}
