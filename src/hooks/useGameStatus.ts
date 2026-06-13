"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type GameStatus = "lobby" | "playing";

export function useGameStatus(code: string) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [status, setStatus] = useState<GameStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the game by its code and load its current status
  useEffect(() => {
    if (!code) return;
    let active = true;

    const load = async () => {
      const { data, error: gameError } = await supabase
        .from("games")
        .select("id, status")
        .eq("code", code)
        .maybeSingle();

      if (!active) return;

      if (gameError || !data) {
        setError("Partie introuvable");
        setLoading(false);
        return;
      }

      setGameId(data.id);
      setStatus(data.status as GameStatus);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [code]);

  // Realtime: react to the game's status changing (lobby -> playing)
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game-status-${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          setStatus((payload.new as { status: GameStatus }).status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return { gameId, status, setStatus, loading, error };
}
