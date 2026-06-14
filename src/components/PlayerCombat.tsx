"use client";

import { useEffect, useRef, useState } from "react";
import type { Combat, Player } from "@/types/game";
import HealthBar from "@/components/HealthBar";
import ImpactBurst from "@/components/ImpactBurst";
import Reveal from "@/components/Reveal";

const PLAYER_MAX_LIFE = 100;

type PlayerCombatProps = {
  combat: Combat;
  player: Player;
  players: Player[];
  onAttack: () => void;
};

export default function PlayerCombat({ combat, player, players, onAttack }: PlayerCombatProps) {
  const prevBossHpRef = useRef(combat.bossHp);
  const [hitTrigger, setHitTrigger] = useState(0);
  const [isHit, setIsHit] = useState(false);

  useEffect(() => {
    if (combat.bossHp < prevBossHpRef.current) {
      setHitTrigger((t) => t + 1);
      setIsHit(true);
      const timeout = setTimeout(() => setIsHit(false), 500);
      prevBossHpRef.current = combat.bossHp;
      return () => clearTimeout(timeout);
    }
    prevBossHpRef.current = combat.bossHp;
  }, [combat.bossHp]);

  if (combat.victory) {
    return (
      <div className="page-shell page-enter items-center justify-center px-4 py-10 sm:px-6">
        <Reveal className="w-full max-w-md">
          <div className="bento-card w-full flex flex-col items-center gap-3 text-center">
            <span className="combat-boss-emoji">🏆</span>
            <h1 className="page-title text-3xl sm:text-4xl">Victoire collective !</h1>
            <p className="body-text">
              {combat.bossName} est vaincu grâce à l&apos;effort collectif de tous les camarades.
            </p>
            <span className="badge">🍄 Champignons collectivisés</span>
            <p className="body-text">Le butin a été partagé équitablement entre tous les joueurs.</p>
            <p className="body-text">En attente que le narrateur clôture le combat…</p>
          </div>
        </Reveal>
      </div>
    );
  }

  const hasChosen = player.combatAction === "attack";

  return (
    <div className="page-shell page-enter items-center px-4 py-8 sm:px-6 gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="eyebrow">Combat — Forêt mystérieuse</span>
        <h1 className="page-title text-3xl sm:text-4xl">{combat.bossName}</h1>
        <span className="badge badge-neutral">Tour {combat.round}</span>
      </div>

      <Reveal className="w-full max-w-md">
        <div className="bento-card w-full flex flex-col items-center gap-3" style={{ position: "relative" }}>
          <span className={`combat-boss-emoji ${isHit ? "is-hit" : ""}`}>🐻</span>
          <div className="w-full flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <span>{combat.bossName}</span>
              <span>{combat.bossHp} / {combat.bossMaxHp}</span>
            </div>
            <HealthBar value={combat.bossHp} max={combat.bossMaxHp} variant="boss" />
          </div>
          <ImpactBurst trigger={hitTrigger} />
        </div>
      </Reveal>

      <Reveal className="w-full max-w-md" delay={80}>
        <div className="bento-card-soft w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <span>Ta vie</span>
            <span>{player.life} / {PLAYER_MAX_LIFE}</span>
          </div>
          <HealthBar value={player.life} max={PLAYER_MAX_LIFE} variant="player" />
        </div>
      </Reveal>

      {player.inGoulag ? (
        <Reveal className="w-full max-w-md" delay={120}>
          <div className="bento-card w-full flex flex-col items-center gap-2 text-center" style={{ background: "var(--accent-soft)" }}>
            <span style={{ fontSize: "2.5rem" }}>🥖</span>
            <p className="body-text">
              Tu es au Goulag : tu sautes ce tour et ne peux pas attaquer.
            </p>
          </div>
        </Reveal>
      ) : (
        <Reveal className="w-full max-w-md" delay={120}>
          <button
            type="button"
            onClick={onAttack}
            disabled={hasChosen}
            className="btn-pill btn-pill-primary w-full"
          >
            {hasChosen ? "🚩 En attente des camarades…" : "🚩 Attaquer"}
          </button>
        </Reveal>
      )}

      <Reveal className="w-full max-w-md" delay={160}>
        <div className="bento-card-soft w-full flex flex-col gap-2">
          <span className="field-label">Camarades</span>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <span
                key={p.id}
                className={`combat-status-pill ${
                  p.inGoulag ? "is-goulag" : p.combatAction === "attack" ? "is-ready" : ""
                }`}
              >
                {p.inGoulag ? "🥖" : p.combatAction === "attack" ? "✅" : "⏳"} {p.name}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {combat.log.length > 0 && (
        <Reveal className="w-full max-w-md" delay={200}>
          <div className="bento-card-soft w-full flex flex-col gap-1">
            <span className="field-label">Journal de combat</span>
            <p className="body-text">{combat.log[combat.log.length - 1]}</p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
