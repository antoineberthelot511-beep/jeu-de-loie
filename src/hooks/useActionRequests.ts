"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type ActionRequest = {
  id: string;
  game_id: string;
  player_id: string;
  content: string;
  status: "pending" | "resolved";
  created_at?: string;
};

/**
 * Loads pending action requests for a game and keeps them in sync in realtime.
 * Requests leave the list as soon as their status moves away from 'pending'.
 */
export function useActionRequests(gameId: string | null) {
  const [requests, setRequests] = useState<ActionRequest[]>([]);

  useEffect(() => {
    if (!gameId) return;
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from("action_requests")
        .select("*")
        .eq("game_id", gameId)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (!active) return;
      setRequests((data ?? []) as ActionRequest[]);
    };

    load();

    const channel = supabase
      .channel(`action-requests-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "action_requests", filter: `game_id=eq.${gameId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRequest = payload.new as ActionRequest;
            if (newRequest.status === "pending") {
              setRequests((prev) => [...prev, newRequest]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as ActionRequest;
            setRequests((prev) =>
              updated.status === "pending"
                ? prev.map((r) => (r.id === updated.id ? updated : r))
                : prev.filter((r) => r.id !== updated.id)
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as ActionRequest).id;
            setRequests((prev) => prev.filter((r) => r.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return requests;
}
