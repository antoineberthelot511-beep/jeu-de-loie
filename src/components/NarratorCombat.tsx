"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Combat, Player } from "@/types/game";
import HealthBar from "@/components/HealthBar";
import Reveal from "@/components/Reveal";

const PLAYER_MAX_LIFE = 100;
const DAMAGE_PER_PLAYER = 10;

type NarratorCombatProps = {
  gameId: string | null;
  combat: Combat;
  players: Player[];
};

export default function NarratorCombat({ gameId, combat, players }: NarratorCombatProps) {
  const [goulagPlayerId, setGoulagPlayerId] = useState("");
  const [sendingGoulag, setSendingGoulag] = useState(false);
  const [closing, setClosing] = useState(false);
  const resolvingRef = useRef(false);

  // Resolve the round as soon as every non-goulag player has chosen "attack".
  useEffect(() => {
    if (!gameId || !combat.active || combat.victory) return;
    if (players.length === 0) return;
    if (resolvingRef.current) return;

    const eligible = players.filter((p) => !p.inGoulag);
    if (eligible.length === 0) return;
    if (!eligible.every((p) => p.combatAction === "attack")) return;

    resolvingRef.current = true;

    const damage = DAMAGE_PER_PLAYER * eligible.length;
    const newBossHp = Math.max(0, combat.bossHp - damage);
    const avgLife = Math.round(players.reduce((sum, p) => sum + p.life, 0) / players.length);
    const isVictory = newBossHp <= 0;

    const logLine = isVictory
      ? `Tour ${combat.round} : la charge collective inflige -${damage} PV. ${combat.bossName} s'effondre ! Les vies sont redistribuées (moyenne : ${avgLife}).`
      : `Tour ${combat.round} : la charge collective inflige -${damage} PV (PV restants : ${newBossHp}). Les vies sont redistribuées (moyenne : ${avgLife}).`;

    const newCombat: Combat = {
      ...combat,
      bossHp: newBossHp,
      round: combat.round + 1,
      log: [...combat.log, logLine],
      active: true,
      victory: isVictory,
    };

    const run = async () => {
      await supabase.from("games").update({ combat: newCombat }).eq("id", gameId);

      await Promise.all(
        players.map((p) => {
          const inventory = isVictory
            ? [
                ...p.inventory,
                {
                  id: crypto.randomUUID(),
                  name: "🍄 Champignons collectivisés",
                  description: "Butin de guerre collectivisé, partagé équitablement entre tous les camarades.",
                },
              ]
            : p.inventory;

          return supabase
            .from("players")
            .update({
              life: avgLife,
              combat_action: null,
              in_goulag: false,
              inventory,
            })
            .eq("id", p.id);
        })
      );

      resolvingRef.current = false;
    };

    void run();
  }, [gameId, combat, players]);

  const handleSendGoulag = async () => {
    const playerId = goulagPlayerId || players[0]?.id;
    if (!playerId) return;

    setSendingGoulag(true);
    await supabase
      .from("players")
      .update({ in_goulag: true, combat_action: null })
      .eq("id", playerId);
    setSendingGoulag(false);
  };

  const handleClose = async () => {
    if (!gameId) return;
    setClosing(true);
    await supabase
      .from("games")
      .update({ combat: { ...combat, active: false, victory: false } })
      .eq("id", gameId);
    setClosing(false);
  };

  if (combat.victory) {
    return (
      <div className="page-shell page-enter items-center justify-center px-4 py-10 sm:px-6">
        <Reveal className="w-full max-w-md">
          <div className="bento-card w-full flex flex-col items-center gap-3 text-center">
            <span className="combat-boss-emoji">🏆</span>
            <h1 className="page-title text-3xl sm:text-4xl">Victoire collective !</h1>
            <p className="body-text">
              {combat.bossName} est vaincu. Le butin a été distribué à tous les joueurs :
            </p>
            <span className="badge">🍄 Champignons collectivisés</span>

            <button
              type="button"
              onClick={handleClose}
              disabled={closing}
              className="btn-pill btn-pill-primary w-full"
            >
              {closing ? "…" : "Fermer le combat"}
            </button>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="page-shell page-enter items-center px-4 py-8 sm:px-6 gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="eyebrow">Combat — Forêt mystérieuse</span>
        <h1 className="page-title text-3xl sm:text-4xl">{combat.bossName}</h1>
        <span className="badge badge-neutral">Tour {combat.round}</span>
      </div>

      <Reveal className="w-full max-w-2xl">
        <div className="bento-card w-full flex flex-col items-center gap-3">
          <span className="combat-boss-emoji">🐻</span>
          <div className="w-full flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <span>{combat.bossName}</span>
              <span>{combat.bossHp} / {combat.bossMaxHp}</span>
            </div>
            <HealthBar value={combat.bossHp} max={combat.bossMaxHp} variant="boss" />
          </div>
        </div>
      </Reveal>

      <Reveal className="w-full max-w-2xl" delay={80}>
        <div className="bento-card w-full flex flex-col gap-3">
          <h3 className="section-title">Camarades</h3>
          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <div key={player.id} className="bento-card-soft flex items-center gap-3">
                {player.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                  <img src={player.image} alt={player.name} className="avatar-circle w-10 h-10 flex-shrink-0" />
                ) : (
                  <span className="avatar-placeholder w-10 h-10 flex-shrink-0">—</span>
                )}
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {player.name}
                  </span>
                  <HealthBar value={player.life} max={PLAYER_MAX_LIFE} variant="player" />
                </div>
                <span
                  className={`combat-status-pill ${
                    player.inGoulag ? "is-goulag" : player.combatAction === "attack" ? "is-ready" : ""
                  }`}
                >
                  {player.inGoulag ? "🥖 Goulag" : player.combatAction === "attack" ? "✅ Prêt" : "⏳"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="w-full max-w-2xl" delay={140}>
        <div className="bento-card w-full flex flex-col gap-3">
          <h3 className="section-title">🥖 Envoyer au Goulag</h3>
          <p className="body-text">
            Le joueur sélectionné saute le prochain tour : il ne peut pas attaquer et la résolution
            ne l&apos;attend pas.
          </p>

          <div>
            <label className="field-label">Joueur ciblé</label>
            <select
              value={goulagPlayerId || players[0]?.id || ""}
              onChange={(e) => setGoulagPlayerId(e.target.value)}
              className="input-field"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}{player.inGoulag ? " (déjà au Goulag)" : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSendGoulag}
            disabled={sendingGoulag}
            className="btn-pill btn-pill-danger w-full"
          >
            {sendingGoulag ? "…" : "🥖 Envoyer au Goulag"}
          </button>
        </div>
      </Reveal>

      {combat.log.length > 0 && (
        <Reveal className="w-full max-w-2xl" delay={200}>
          <div className="bento-card-soft w-full flex flex-col gap-2">
            <span className="field-label">Journal de combat</span>
            <div className="flex flex-col gap-1">
              {combat.log.slice(-5).reverse().map((line, i) => (
                <p key={i} className="body-text">{line}</p>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
