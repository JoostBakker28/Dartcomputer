"use client";

import { useState } from "react";

import { DEFAULT_SETTINGS, type MatchSettings } from "./match-rules";
import MatchSetup from "./match-setup";
import Scoreboard from "./scoreboard";

const DEFAULT_NAMES = ["Player 1", "Player 2"];

/**
 * Owns what outlives a single match: the names and the rules. Both survive a
 * trip back to the setup screen, while the scoreboard starts from nil every
 * time a match is started from there.
 */
export default function Match() {
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [settings, setSettings] = useState<MatchSettings>(DEFAULT_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isPlaying) {
    return (
      <MatchSetup
        names={names}
        settings={settings}
        onNamesChange={setNames}
        onSettingsChange={setSettings}
        onStart={() => {
          // A blank name would leave the banners with nothing to call anyone.
          setNames((current) =>
            current.map((name, index) => name.trim() || DEFAULT_NAMES[index]),
          );
          setIsPlaying(true);
        }}
      />
    );
  }

  return (
    <Scoreboard
      settings={settings}
      names={names}
      onNameChange={(playerIndex, name) =>
        setNames((current) =>
          current.map((existing, index) =>
            index === playerIndex ? name : existing,
          ),
        )
      }
      onNewMatch={() => setIsPlaying(false)}
    />
  );
}
