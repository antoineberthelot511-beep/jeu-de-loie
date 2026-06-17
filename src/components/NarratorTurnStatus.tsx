"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/types/game";
import Reveal from "@/components/Reveal";

type NarratorTurnStatusProps = {
  gameId: string | null;
  round: number;
  players: Player[];
};

// Tri déterministe : roll décroissant, départage par id (stable sur tous les clients).
function sortByRoll(ps: Player[]): Player[] {
  return [...ps].sort((a, b) => {
    const diff = (b.roll ?? 0) - (a.roll ?? 0);
    return diff !== 0 ? diff : a.id < b.id ? -1 : 1;
  });
}

export default function NarratorTurnStatus({ gameId, round, players }: NarratorTurnStatusProps) {
  const resetTriggeredRef = useRef(false);

  // Refs pour lire les valeurs fraîches depuis l'effet sans les lister en dépendances
  // (évite de re-déclencher l'effet sur chaque update realtime de players/round).
  const playersRef = useRef(players);
  playersRef.current = players;
  const roundRef = useRef(round);
  roundRef.current = round;

  const rolledCount = players.filter((p) => p.roll !== null).length;
  const allRolled = players.length > 0 && rolledCount === players.length;
  const allMoved = players.length > 0 && players.every((p) => p.hasMoved);
  const ranking = allRolled ? sortByRoll(players) : [];
  const currentTurnPlayer = ranking.find((p) => !p.hasMoved);

  // Quand tout le monde a bougé : nouveau tour (reset roll/has_moved, round + 1).
  // Dépend uniquement de allMoved (booléen) et gameId (string) — pas du tableau players
  // qui changerait à chaque event realtime et causerait des re-runs en cascade.
  useEffect(() => {
    if (!gameId) return;

    if (!allMoved) {
      resetTriggeredRef.current = false;
      return;
    }

    if (resetTriggeredRef.current) return;
    resetTriggeredRef.current = true;

    const ps = playersRef.current;
    const r = roundRef.current;
    ps.forEach((p) => {
      void supabase.from("players").update({ roll: null, has_moved: false }).eq("id", p.id).then();
    });
    void supabase.from("games").update({ round: r + 1 }).eq("id", gameId).then();
  }, [allMoved, gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (players.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 max-w-2xl mx-auto w-full pt-3">
      <Reveal>
        <div className="bento-card-soft w-full flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="eyebrow">🎡 Roue du Chaos</span>
            <span className="badge badge-neutral">Tour {round}</span>
          </div>

          {!allRolled ? (
            <p className="body-text">
              En attente que tout le monde tourne la roue ({rolledCount}/{players.length})
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {ranking.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {i + 1}. {p.name} — 🎲 {p.roll}
                  </span>
                  {p.hasMoved ? (
                    <span className="badge badge-neutral">Joué</span>
                  ) : currentTurnPlayer?.id === p.id ? (
                    <span className="badge">À toi !</span>
                  ) : (
                    <span className="badge badge-neutral">En attente</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
