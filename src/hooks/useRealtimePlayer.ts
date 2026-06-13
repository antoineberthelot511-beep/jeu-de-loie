"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rowToPlayer, type PlayerRow } from "@/lib/players";
import type { Player } from "@/types/game";

/**
 * Loads a single player by id and keeps it in sync in realtime.
 */
export function useRealtimePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .maybeSingle();

      if (!active) return;
      setPlayer(data ? rowToPlayer(data as PlayerRow) : null);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`player-${playerId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "players", filter: `id=eq.${playerId}` },
        (payload) => {
          setPlayer(rowToPlayer(payload.new as PlayerRow));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [playerId]);

  return { player, loading };
}
