"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rowToPlayer, type PlayerRow } from "@/lib/players";
import type { Player } from "@/types/game";

/**
 * Loads every player of a game and keeps the list in sync in realtime.
 */
export function useRealtimePlayers(gameId: string | null) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!gameId) return;
    let active = true;

    const load = async () => {
      const { data } = await supabase.from("players").select("*").eq("game_id", gameId);
      if (!active) return;
      setPlayers((data ?? []).map((row) => rowToPlayer(row as PlayerRow)));
    };

    load();

    const channel = supabase
      .channel(`players-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `game_id=eq.${gameId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newPlayer = rowToPlayer(payload.new as PlayerRow);
            setPlayers((prev) =>
              prev.some((p) => p.id === newPlayer.id) ? prev : [...prev, newPlayer]
            );
          } else if (payload.eventType === "UPDATE") {
            const updatedPlayer = rowToPlayer(payload.new as PlayerRow);
            setPlayers((prev) =>
              prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as PlayerRow).id;
            setPlayers((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return players;
}
