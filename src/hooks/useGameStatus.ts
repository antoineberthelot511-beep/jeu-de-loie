"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_COMBAT, type Combat } from "@/types/game";

export type GameStatus = "lobby" | "playing";

export type WorldImages = Record<string, string>;

export function useGameStatus(code: string) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [status, setStatus] = useState<GameStatus | null>(null);
  const [worldImages, setWorldImages] = useState<WorldImages>({});
  const [combat, setCombat] = useState<Combat>(DEFAULT_COMBAT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the game by its code and load its current status
  useEffect(() => {
    if (!code) return;
    let active = true;

    const load = async () => {
      const { data, error: gameError } = await supabase
        .from("games")
        .select("id, status, world_images, combat")
        .eq("code", code.toUpperCase())
        .maybeSingle();

      if (!active) return;

      if (gameError) {
        console.error("useGameStatus:", gameError.message, gameError.code, gameError.details, gameError.hint);
      }

      if (gameError || !data) {
        setError("Partie introuvable");
        setLoading(false);
        return;
      }

      setGameId(data.id);
      setStatus(data.status as GameStatus);
      setWorldImages((data.world_images as WorldImages | null) ?? {});
      setCombat((data.combat as Combat | null) ?? DEFAULT_COMBAT);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [code]);

  // Realtime: react to the game's status, world images or combat state changing
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game-status-${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const row = payload.new as { status: GameStatus; world_images: WorldImages | null; combat: Combat | null };
          setStatus(row.status);
          setWorldImages(row.world_images ?? {});
          setCombat(row.combat ?? DEFAULT_COMBAT);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return { gameId, status, setStatus, worldImages, combat, loading, error };
}
