"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import {
  DARTS_PER_TURN,
  canCheckout,
  createPlayer,
  emptyDarts,
  findWinner,
  isDartComplete,
  lastTurnPlayer,
  sanitizeDartInput,
  turnOutcome,
  type Player,
  type TurnOutcome,
} from "./darts";
import PlayerPanel from "./player-panel";

const createPlayers = (): Player[] => [
  createPlayer("Player 1"),
  createPlayer("Player 2"),
];

export default function Scoreboard() {
  const [players, setPlayers] = useState<Player[]>(createPlayers);
  const [activePlayer, setActivePlayer] = useState(0);

  const dartRefs = useRef<(HTMLInputElement | null)[][]>([[], []]);
  const winner = findWinner(players);
  const undoTarget = lastTurnPlayer(players);

  const focusDart = (playerIndex: number, dartIndex: number) => {
    dartRefs.current[playerIndex]?.[dartIndex]?.focus();
  };

  // Hand focus to the first dart of whoever is up next. The turn count is a
  // dependency too, so an undo that hands the turn back to the player who is
  // already active still moves focus.
  const activeTurnCount = players[activePlayer].history.length;
  useEffect(() => {
    focusDart(activePlayer, 0);
  }, [activePlayer, activeTurnCount]);

  const updatePlayer = (playerIndex: number, patch: Partial<Player>) => {
    setPlayers((current) =>
      current.map((player, index) =>
        index === playerIndex ? { ...player, ...patch } : player,
      ),
    );
  };

  const handleDartChange = (
    playerIndex: number,
    dartIndex: number,
    rawValue: string,
  ) => {
    const value = sanitizeDartInput(rawValue);
    if (value === null) return;

    const player = players[playerIndex];
    const darts = player.darts.map((dart, index) =>
      index === dartIndex ? value : dart,
    );

    updatePlayer(playerIndex, {
      darts,
      // Editing a dart can push the checkout back out of range.
      isDouble: canCheckout({ ...player, darts }) ? player.isDouble : false,
    });

    if (isDartComplete(value) && dartIndex < DARTS_PER_TURN - 1) {
      focusDart(playerIndex, dartIndex + 1);
    }
  };

  /**
   * Records the turn. The outcome is classified from the score unless one is
   * forced, which is what the "No score" button does.
   */
  const submitTurn = (playerIndex: number, forcedOutcome?: TurnOutcome) => {
    const player = players[playerIndex];
    const outcome = forcedOutcome ?? turnOutcome(player);
    const isNoScore = outcome === "no-score";

    updatePlayer(playerIndex, {
      darts: emptyDarts(),
      isDouble: false,
      history: [
        ...player.history,
        {
          darts: isNoScore ? emptyDarts() : player.darts,
          isDouble: isNoScore ? false : player.isDouble,
          outcome,
        },
      ],
    });

    // A checkout ends the leg, so the turn does not pass.
    if (outcome !== "checkout") {
      setActivePlayer((current) => (current === 0 ? 1 : 0));
    }
  };

  /**
   * Takes back the most recent turn, whichever player threw it, and hands them
   * the turn again with their darts back in the input fields so a mistyped
   * score can be corrected. Pressing it repeatedly walks the whole leg back,
   * including a checkout that was entered by mistake.
   */
  const undoLastTurn = () => {
    if (undoTarget === null) return;

    const { history } = players[undoTarget];
    const lastTurn = history[history.length - 1];

    updatePlayer(undoTarget, {
      darts: lastTurn.darts,
      isDouble: lastTurn.isDouble,
      history: history.slice(0, -1),
    });
    setActivePlayer(undoTarget);
  };

  const startNewLeg = () => {
    setPlayers((current) => current.map((player) => createPlayer(player.name)));
    setActivePlayer(0);
  };

  const handleDartKeyDown = (
    playerIndex: number,
    dartIndex: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    const darts = players[playerIndex].darts;

    if (event.key === "Enter") {
      event.preventDefault();
      if (dartIndex < DARTS_PER_TURN - 1) {
        focusDart(playerIndex, dartIndex + 1);
      } else if (darts.some((dart) => dart !== "")) {
        submitTurn(playerIndex);
      }
      return;
    }

    // Backspace in an already empty field steps back to the previous dart.
    if (event.key === "Backspace" && darts[dartIndex] === "" && dartIndex > 0) {
      event.preventDefault();
      focusDart(playerIndex, dartIndex - 1);
    }
  };

  const renderPlayer = (playerIndex: number) => (
    <PlayerPanel
      player={players[playerIndex]}
      isActive={playerIndex === activePlayer && winner === null}
      canSubmit={players[playerIndex].darts.some((dart) => dart !== "")}
      onNameChange={(name) => updatePlayer(playerIndex, { name })}
      onDartChange={(dartIndex, value) =>
        handleDartChange(playerIndex, dartIndex, value)
      }
      onDartKeyDown={(dartIndex, event) =>
        handleDartKeyDown(playerIndex, dartIndex, event)
      }
      onDoubleChange={(isDouble) => updatePlayer(playerIndex, { isDouble })}
      onSubmitTurn={() => submitTurn(playerIndex)}
      onNoScore={() => submitTurn(playerIndex, "no-score")}
      registerDartRef={(dartIndex, element) => {
        dartRefs.current[playerIndex][dartIndex] = element;
      }}
    />
  );

  return (
    <div className="flex w-full flex-col gap-6">
      {winner !== null && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500 bg-emerald-500/10 px-5 py-4">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            {players[winner].name} checked out and won the leg.
          </p>
          <button
            type="button"
            onClick={startNewLeg}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            New leg
          </button>
        </div>
      )}

      <div className="grid w-full gap-6 md:grid-cols-[1fr_auto_1fr]">
        {renderPlayer(0)}

        {/* Between the two panels: the undo applies to whoever threw last. */}
        <div className="flex justify-center md:self-center">
          <button
            type="button"
            onClick={undoLastTurn}
            disabled={undoTarget === null}
            title={
              undoTarget === null
                ? "No turns to undo yet"
                : `Undo ${players[undoTarget].name}'s last turn`
            }
            className="rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-600 shadow-sm transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-transparent disabled:text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:disabled:border-zinc-800 dark:disabled:bg-transparent dark:disabled:text-zinc-700"
          >
            Undo
          </button>
        </div>

        {renderPlayer(1)}
      </div>
    </div>
  );
}
