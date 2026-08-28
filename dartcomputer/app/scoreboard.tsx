"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import {
  DARTS_PER_TURN,
  canCheckout,
  createPlayer,
  isDartComplete,
  sanitizeDartInput,
  type Player,
} from "./darts";
import PlayerPanel from "./player-panel";

export default function Scoreboard() {
  const [players, setPlayers] = useState<Player[]>(() => [
    createPlayer("Player 1"),
    createPlayer("Player 2"),
  ]);
  const [activePlayer, setActivePlayer] = useState(0);

  const dartRefs = useRef<(HTMLInputElement | null)[][]>([[], []]);

  const focusDart = (playerIndex: number, dartIndex: number) => {
    dartRefs.current[playerIndex]?.[dartIndex]?.focus();
  };

  // Hand focus to the first dart of whoever is up next.
  useEffect(() => {
    focusDart(activePlayer, 0);
  }, [activePlayer]);

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

  /** Records the turn as thrown, or as a zero when `scored` is false. */
  const submitTurn = (playerIndex: number, scored: boolean) => {
    const player = players[playerIndex];
    updatePlayer(playerIndex, {
      darts: Array<string>(DARTS_PER_TURN).fill(""),
      isDouble: false,
      history: [
        ...player.history,
        { darts: player.darts, isDouble: player.isDouble, scored },
      ],
    });
    setActivePlayer((current) => (current === 0 ? 1 : 0));
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
        submitTurn(playerIndex, true);
      }
      return;
    }

    // Backspace in an already empty field steps back to the previous dart.
    if (event.key === "Backspace" && darts[dartIndex] === "" && dartIndex > 0) {
      event.preventDefault();
      focusDart(playerIndex, dartIndex - 1);
    }
  };

  return (
    <div className="grid w-full gap-6 md:grid-cols-2">
      {players.map((player, playerIndex) => (
        <PlayerPanel
          key={playerIndex}
          player={player}
          isActive={playerIndex === activePlayer}
          canSubmit={player.darts.some((dart) => dart !== "")}
          onNameChange={(name) => updatePlayer(playerIndex, { name })}
          onDartChange={(dartIndex, value) =>
            handleDartChange(playerIndex, dartIndex, value)
          }
          onDartKeyDown={(dartIndex, event) =>
            handleDartKeyDown(playerIndex, dartIndex, event)
          }
          onDoubleChange={(isDouble) => updatePlayer(playerIndex, { isDouble })}
          onSubmitTurn={() => submitTurn(playerIndex, true)}
          onNoScore={() => submitTurn(playerIndex, false)}
          registerDartRef={(dartIndex, element) => {
            dartRefs.current[playerIndex][dartIndex] = element;
          }}
        />
      ))}
    </div>
  );
}
