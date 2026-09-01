"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import {
  DARTS_PER_TURN,
  LEGS_PER_SET,
  MAXIMUM_SCORE,
  awardLeg,
  bestOf,
  createPlayer,
  emptyDarts,
  findLegWinner,
  findMatchWinner,
  formatSummary,
  isDartComplete,
  sanitizeDartInput,
  startLeg,
  turnOutcome,
  turnTotal,
  winsNeeded,
  wonSet,
  type MatchSettings,
  type Player,
  type Turn,
  type TurnOutcome,
} from "./darts";
import MatchStats from "./match-stats";
import PlayerPanel from "./player-panel";

/** Served from public/, so the browser fetches it straight from the root. */
const MAXIMUM_SOUND = "/180.m4a";

/** Everything an undo has to put back, captured before each turn is recorded. */
type Snapshot = {
  players: Player[];
  activePlayer: number;
  startingPlayer: number;
};

type ScoreboardProps = {
  settings: MatchSettings;
  names: string[];
  onNameChange: (playerIndex: number, name: string) => void;
  /** Back to the setup screen, keeping the names and the current rules. */
  onNewMatch: () => void;
};

export default function Scoreboard({
  settings,
  names,
  onNameChange,
  onNewMatch,
}: ScoreboardProps) {
  const [players, setPlayers] = useState<Player[]>(() => [
    createPlayer(),
    createPlayer(),
  ]);
  const [activePlayer, setActivePlayer] = useState(0);
  /** Who throws first in the current leg; the two take it in turns. */
  const [startingPlayer, setStartingPlayer] = useState(0);
  const [past, setPast] = useState<Snapshot[]>([]);

  const dartRefs = useRef<(HTMLInputElement | null)[][]>([[], []]);
  const maximumSound = useRef<HTMLAudioElement | null>(null);
  const legWinner = findLegWinner(players);
  const matchWinner = findMatchWinner(players, settings);
  const playingSets = settings.format === "sets";

  const focusDart = (playerIndex: number, dartIndex: number) => {
    dartRefs.current[playerIndex]?.[dartIndex]?.focus();
  };

  useEffect(() => {
    maximumSound.current = new Audio(MAXIMUM_SOUND);
  }, []);

  const callMaximum = () => {
    const sound = maximumSound.current;
    if (sound === null) return;

    sound.currentTime = 0;
    void sound.play().catch(() => {});
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

  /** Puts the board as it stands now on the undo stack. */
  const rememberState = () => {
    setPast((current) => [...current, { players, activePlayer, startingPlayer }]);
  };

  const handleDartChange = (
    playerIndex: number,
    dartIndex: number,
    rawValue: string,
  ) => {
    const value = sanitizeDartInput(rawValue);
    if (value === null) return;

    const darts = players[playerIndex].darts.map((dart, index) =>
      index === dartIndex ? value : dart,
    );

    updatePlayer(playerIndex, { darts });

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

    const turn: Turn = {
      darts: isNoScore ? emptyDarts() : player.darts,
      outcome,
    };
    const recorded: Player = {
      ...player,
      darts: emptyDarts(),
      history: [...player.history, turn],
    };
    const next = players.map((current, index) =>
      index === playerIndex ? recorded : current,
    );

    // A busted 180 scores nothing, so it does not get the call.
    if (turnTotal(turn) === MAXIMUM_SCORE) callMaximum();

    rememberState();

    // A checkout ends the leg, so the turn does not pass; it is credited.
    if (outcome === "checkout") {
      setPlayers(awardLeg(next, playerIndex, settings));
      return;
    }

    setPlayers(next);
    setActivePlayer(playerIndex === 0 ? 1 : 0);
  };

  /**
   * Steps the whole board back to just before the last turn was recorded, so
   * the darts are back in the fields of the player who threw them. Pressing it
   * repeatedly walks the match back turn by turn, legs and sets included.
   */
  const undoLastTurn = () => {
    const previous = past[past.length - 1];
    if (previous === undefined) return;

    setPlayers(previous.players);
    setActivePlayer(previous.activePlayer);
    setStartingPlayer(previous.startingPlayer);
    setPast((current) => current.slice(0, -1));
  };

  const startNextLeg = () => {
    rememberState();
    setPlayers((current) => current.map(startLeg));
    // The throw alternates from leg to leg.
    const nextStarter = startingPlayer === 0 ? 1 : 0;
    setStartingPlayer(nextStarter);
    setActivePlayer(nextStarter);
  };

  /** Same rules and names, everything else back to nil. */
  const playAgain = () => {
    setPlayers([createPlayer(), createPlayer()]);
    setActivePlayer(0);
    setStartingPlayer(0);
    setPast([]);
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
      name={names[playerIndex]}
      isActive={playerIndex === activePlayer && legWinner === null}
      canSubmit={players[playerIndex].darts.some((dart) => dart !== "")}
      showSets={playingSets}
      onNameChange={(name) => onNameChange(playerIndex, name)}
      onDartChange={(dartIndex, value) =>
        handleDartChange(playerIndex, dartIndex, value)
      }
      onDartKeyDown={(dartIndex, event) =>
        handleDartKeyDown(playerIndex, dartIndex, event)
      }
      onSubmitTurn={() => submitTurn(playerIndex)}
      onNoScore={() => submitTurn(playerIndex, "no-score")}
      registerDartRef={(dartIndex, element) => {
        dartRefs.current[playerIndex][dartIndex] = element;
      }}
    />
  );

  const matchScore = playingSets
    ? `${players[0].sets}–${players[1].sets} in sets`
    : `${players[0].legs}–${players[1].legs} in legs`;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {formatSummary(settings)}
          <span className="text-zinc-400 dark:text-zinc-500">
            {" · "}
            first to {winsNeeded(bestOf(settings))}
            {playingSets ? ` · each set is best of ${LEGS_PER_SET} legs` : ""}
          </span>
        </p>
        <button
          type="button"
          onClick={onNewMatch}
          className="text-sm font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          New match
        </button>
      </div>

      {matchWinner !== null && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500 bg-emerald-500/10 px-5 py-4">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            {names[matchWinner]} won the match {matchScore}.
          </p>
          <button
            type="button"
            onClick={playAgain}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Play again
          </button>
        </div>
      )}

      {matchWinner !== null && <MatchStats names={names} players={players} />}

      {matchWinner === null && legWinner !== null && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500 bg-emerald-500/10 px-5 py-4">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            {names[legWinner]} won the{" "}
            {wonSet(players, legWinner, settings) ? "set" : "leg"}. Match stands
            at {matchScore}.
          </p>
          <button
            type="button"
            onClick={startNextLeg}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Next leg
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
            disabled={past.length === 0}
            title={
              past.length === 0 ? "Nothing to undo yet" : "Undo the last turn"
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
