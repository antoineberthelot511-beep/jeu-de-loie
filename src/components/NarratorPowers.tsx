"use client";

import { useState } from "react";
import type { Player } from "@/types/game";
import type { ActionRequest } from "@/hooks/useActionRequests";
import ActionRequests from "@/components/ActionRequests";
import Reveal from "@/components/Reveal";

type NarratorPowersProps = {
  players: Player[];
  requests: ActionRequest[];
  onResolve: (requestId: string) => void;
  onSummonCroqueMonsieur: () => void;
};

export default function NarratorPowers({
  players,
  requests,
  onResolve,
  onSummonCroqueMonsieur,
}: NarratorPowersProps) {
  const [judgePlayerId, setJudgePlayerId] = useState("");
  const [punishProbability, setPunishProbability] = useState(50);
  const [judgmentMessage, setJudgmentMessage] = useState<string | null>(null);

  const handleJudge = () => {
    const playerId = judgePlayerId || players[0]?.id;
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    if (Math.random() < punishProbability / 100) {
      onSummonCroqueMonsieur();
      setJudgmentMessage(`Châtiment : ${player.name} a été puni.`);
    } else {
      setJudgmentMessage("L'action passe, pas de châtiment cette fois.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
      <ActionRequests requests={requests} players={players} onResolve={onResolve} />

      <Reveal delay={60}>
        <div className="bento-card w-full flex flex-col gap-3">
          <h3 className="section-title">Châtiment</h3>
          <button
            type="button"
            onClick={onSummonCroqueMonsieur}
            className="btn-pill btn-pill-danger w-full"
          >
            Invoquer le croque-monsieur
          </button>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="bento-card w-full flex flex-col gap-3">
          <h3 className="section-title">Action interdite</h3>

          <div>
            <label className="field-label">Joueur qui tente l&apos;action</label>
            <select
              value={judgePlayerId || players[0]?.id || ""}
              onChange={(e) => setJudgePlayerId(e.target.value)}
              className="input-field"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">
              Probabilité de châtiment : {punishProbability}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={punishProbability}
              onChange={(e) => setPunishProbability(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPunishProbability(20)}
              className="btn-pill btn-pill-secondary btn-pill-sm flex-1"
            >
              Léger
            </button>
            <button
              type="button"
              onClick={() => setPunishProbability(50)}
              className="btn-pill btn-pill-secondary btn-pill-sm flex-1"
            >
              Moyen
            </button>
            <button
              type="button"
              onClick={() => setPunishProbability(80)}
              className="btn-pill btn-pill-secondary btn-pill-sm flex-1"
            >
              Grave
            </button>
          </div>

          <button type="button" onClick={handleJudge} className="btn-pill btn-pill-primary w-full">
            Juger l&apos;action
          </button>

          {judgmentMessage && (
            <p className={judgmentMessage.startsWith("Châtiment") ? "danger-text" : "success-text"}>
              {judgmentMessage}
            </p>
          )}
        </div>
      </Reveal>
    </div>
  );
}
