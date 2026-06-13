"use client";

import { useState } from "react";
import type { Item, Player } from "@/types/game";

type NarrateurPanelProps = {
  players: Player[];
  onGiveItem: (playerId: string, item: Item) => boolean;
  onRemoveItem: (playerId: string, itemId: string) => void;
  onAdjustMoney: (playerId: string, amount: number) => void;
  onSummonCroqueMonsieur: () => void;
};

export default function NarrateurPanel({
  players,
  onGiveItem,
  onRemoveItem,
  onAdjustMoney,
  onSummonCroqueMonsieur,
}: NarrateurPanelProps) {
  const [open, setOpen] = useState(false);
  const [targetPlayerId, setTargetPlayerId] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [durability, setDurability] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [judgePlayerId, setJudgePlayerId] = useState("");
  const [punishProbability, setPunishProbability] = useState(50);
  const [judgmentMessage, setJudgmentMessage] = useState<string | null>(null);
  const [moneyAmount, setMoneyAmount] = useState("10");

  const parsedMoneyAmount = Number(moneyAmount) || 0;

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") setImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const playerId = targetPlayerId || players[0]?.id;
    if (!trimmedName || !playerId) return;

    const parsedDurability = durability.trim() === "" ? undefined : Number(durability);

    const isCollective = onGiveItem(playerId, {
      id: crypto.randomUUID(),
      name: trimmedName,
      price: 0,
      image,
      durability:
        parsedDurability !== undefined && Number.isFinite(parsedDurability)
          ? parsedDurability
          : undefined,
      description: description.trim() || undefined,
    });

    setMessage(
      isCollective
        ? `Propriété collective : tout le monde reçoit ${trimmedName}.`
        : null
    );

    setName("");
    setImage(undefined);
    setDurability("");
    setDescription("");
  };

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
    <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[10000]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="btn-pill btn-pill-glass"
      >
        Narrateur
      </button>

      {open && (
        <div className="floating-panel bento-card mt-3 w-[20rem] sm:w-96 max-h-[80vh] overflow-y-auto flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="section-title">Invoquer un objet</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="field-label">Joueur cible</label>
                <select
                  value={targetPlayerId || players[0]?.id || ""}
                  onChange={(e) => setTargetPlayerId(e.target.value)}
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
                <label className="field-label">Nom de l&apos;objet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Épée légendaire"
                  className="input-field"
                />
              </div>

              <div>
                <label className="field-label">Image (optionnel)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                  className="file-field"
                />
              </div>

              <div>
                <label className="field-label">Durabilité</label>
                <input
                  type="number"
                  value={durability}
                  onChange={(e) => setDurability(e.target.value)}
                  placeholder="Ex: 10"
                  className="input-field"
                />
              </div>

              <div>
                <label className="field-label">Caractéristiques</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: +5 attaque, brille dans le noir..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <button type="submit" className="btn-pill btn-pill-primary w-full">
                Invoquer
              </button>
            </form>

            {message && <p className="success-text">{message}</p>}
          </div>

          <hr className="divider" />

          <div className="flex flex-col gap-3">
            <h3 className="section-title">Gestion des joueurs</h3>

            <div>
              <label className="field-label">Montant des roupies</label>
              <input
                type="number"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
                placeholder="Ex: 10"
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-3">
              {players.map((player) => (
                <div key={player.id} className="bento-card-soft flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {player.name}
                    </span>
                    <span className="badge">{player.money}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onAdjustMoney(player.id, parsedMoneyAmount)}
                      className="btn-pill btn-pill-soft btn-pill-sm flex-1"
                    >
                      + Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustMoney(player.id, -parsedMoneyAmount)}
                      className="btn-pill btn-pill-danger btn-pill-sm flex-1"
                    >
                      - Retirer
                    </button>
                  </div>

                  {player.inventory.length > 0 ? (
                    <div className="flex flex-col gap-1.5 pt-1">
                      {player.inventory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-xl px-3 py-1.5"
                          style={{ background: "var(--bg-card)" }}
                        >
                          <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>
                            {item.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(player.id, item.id)}
                            className="btn-link"
                            style={{ color: "var(--danger)", fontSize: "0.75rem" }}
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="body-text text-xs">Inventaire vide.</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <hr className="divider" />

          <div className="flex flex-col gap-3">
            <h3 className="section-title">Invoquer un châtiment</h3>
            <button
              type="button"
              onClick={onSummonCroqueMonsieur}
              className="btn-pill btn-pill-danger w-full"
            >
              Invoquer le croque-monsieur
            </button>
          </div>

          <hr className="divider" />

          <div className="flex flex-col gap-3">
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
        </div>
      )}
    </div>
  );
}
