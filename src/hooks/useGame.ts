"use client";

import { useCallback, useEffect, useState } from "react";
import type { Player } from "@/types/game";

const PLAYERS_KEY = "players";
const TURN_KEY = "currentPlayerIndex";

export function useGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    try {
      const savedPlayers = localStorage.getItem(PLAYERS_KEY);
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));

      const savedTurn = localStorage.getItem(TURN_KEY);
      if (savedTurn) setCurrentPlayerIndex(JSON.parse(savedTurn));
    } catch (e) {
      console.warn("Failed to load game state from localStorage", e);
    }
    setLoaded(true);
  }, []);

  // Persist players whenever they change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  }, [players, loaded]);

  // Persist current turn whenever it changes
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(TURN_KEY, JSON.stringify(currentPlayerIndex));
  }, [currentPlayerIndex, loaded]);

  const currentPlayer = players[currentPlayerIndex];

  /**
   * Teleport the current player to the given world and pass the turn
   * to the next player.
   */
  const teleportCurrentPlayer = useCallback(
    (worldId: Player["location"]) => {
      if (players.length === 0) return;

      setPlayers((prev) =>
        prev.map((p, i) =>
          i === currentPlayerIndex ? { ...p, location: worldId } : p
        )
      );
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    },
    [players.length, currentPlayerIndex]
  );

  return {
    players,
    setPlayers,
    currentPlayer,
    currentPlayerIndex,
    teleportCurrentPlayer,
  };
}
