"use client";

import { useState } from "react";
import type { Item, Player } from "@/types/game";
import TitleBar from "@/components/TitleBar";

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
        ? `☭ PROPRIÉTÉ COLLECTIVE : tout le monde reçoit ${trimmedName} !`
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
      setJudgmentMessage(`☠ CHÂTIMENT : ${player.name} a été puni !`);
    } else {
      setJudgmentMessage("L'action passe... pas de châtiment cette fois.");
    }
  };

  return (
    <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[10000]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="y2k-btn y2k-btn-magenta"
      >
        🎙️ Narrateur
      </button>

      {open && (
        <div className="y2k-window mt-2 w-72 sm:w-80 max-h-[75vh] overflow-y-auto">
          <TitleBar title="Narrateur - Maître du jeu" />

          <div className="y2k-window-content space-y-4">
            <div>
              <h3 className="chrome-text text-lg text-center mb-2">
                <span className="sparkle">Invoquer un objet</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label className="y2k-label block mb-1">Joueur cible</label>
                  <select
                    value={targetPlayerId || players[0]?.id || ""}
                    onChange={(e) => setTargetPlayerId(e.target.value)}
                    className="y2k-input w-full"
                  >
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="y2k-label block mb-1">Nom de l&apos;objet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Épée légendaire"
                    className="y2k-input w-full"
                  />
                </div>

                <div>
                  <label className="y2k-label block mb-1">Image (optionnel)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files?.[0])}
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-terminal), monospace",
                      color: "var(--acid-green)",
                    }}
                  />
                </div>

                <div>
                  <label className="y2k-label block mb-1">Durabilité</label>
                  <input
                    type="number"
                    value={durability}
                    onChange={(e) => setDurability(e.target.value)}
                    placeholder="Ex: 10"
                    className="y2k-input w-full"
                  />
                </div>

                <div>
                  <label className="y2k-label block mb-1">Caractéristiques</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: +5 attaque, brille dans le noir..."
                    rows={3}
                    className="y2k-input w-full resize-none"
                  />
                </div>

                <button type="submit" className="y2k-btn y2k-btn-green w-full">
                  ✦ Invoquer ✦
                </button>
              </form>

              {message && (
                <p
                  className="text-center text-sm mt-2"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    color: "var(--acid-green)",
                  }}
                >
                  {message}
                </p>
              )}
            </div>

            <hr className="chrome-divider" />

            <div>
              <h3 className="chrome-text text-lg text-center mb-2">
                <span className="sparkle">Gestion des joueurs</span>
              </h3>

              <div className="mb-2">
                <label className="y2k-label block mb-1">Montant des roupies</label>
                <input
                  type="number"
                  value={moneyAmount}
                  onChange={(e) => setMoneyAmount(e.target.value)}
                  placeholder="Ex: 10"
                  className="y2k-input w-full"
                />
              </div>

              <div className="space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="glass-item p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ fontFamily: "var(--font-terminal), monospace", color: "var(--text-strong)" }}
                      >
                        {player.name}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--acid-green)" }}
                      >
                        💰 {player.money}
                      </span>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => onAdjustMoney(player.id, parsedMoneyAmount)}
                        className="y2k-btn y2k-btn-green y2k-btn-sm flex-1"
                      >
                        + Ajouter
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustMoney(player.id, -parsedMoneyAmount)}
                        className="y2k-btn y2k-btn-magenta y2k-btn-sm flex-1"
                      >
                        - Retirer
                      </button>
                    </div>

                    {player.inventory.length > 0 ? (
                      <div className="space-y-1">
                        {player.inventory.map((item) => (
                          <div
                            key={item.id}
                            className="glass-item-sm flex items-center justify-between gap-2 p-1"
                          >
                            <span
                              className="text-xs truncate"
                              style={{ fontFamily: "var(--font-terminal), monospace", color: "var(--text-strong)" }}
                            >
                              {item.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(player.id, item.id)}
                              className="y2k-btn y2k-btn-magenta y2k-btn-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="y2k-label text-center text-xs">// inventaire vide //</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <hr className="chrome-divider" />

            <div>
              <h3 className="chrome-text text-lg text-center mb-2">
                <span className="sparkle">Invoquer un châtiment</span>
              </h3>
              <button
                type="button"
                onClick={onSummonCroqueMonsieur}
                className="y2k-btn y2k-btn-magenta w-full"
              >
                🥪 Invoquer le croque-monsieur
              </button>
            </div>

            <hr className="chrome-divider" />

            <div>
              <h3 className="chrome-text text-lg text-center mb-2">
                <span className="sparkle">⚠️ ACTION INTERDITE</span>
              </h3>

              <div className="space-y-2">
                <div>
                  <label className="y2k-label block mb-1">Joueur qui tente l&apos;action</label>
                  <select
                    value={judgePlayerId || players[0]?.id || ""}
                    onChange={(e) => setJudgePlayerId(e.target.value)}
                    className="y2k-input w-full"
                  >
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="y2k-label block mb-1">
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
                    className="y2k-btn y2k-btn-green y2k-btn-sm flex-1"
                  >
                    Léger 20%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPunishProbability(50)}
                    className="y2k-btn y2k-btn-chrome y2k-btn-sm flex-1"
                  >
                    Moyen 50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPunishProbability(80)}
                    className="y2k-btn y2k-btn-magenta y2k-btn-sm flex-1"
                  >
                    Grave 80%
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleJudge}
                  className="y2k-btn y2k-btn-magenta w-full"
                >
                  ⚖️ JUGER L&apos;ACTION
                </button>

                {judgmentMessage && (
                  <p
                    className="text-center text-sm mt-2"
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      color: judgmentMessage.startsWith("☠")
                        ? "var(--magenta)"
                        : "var(--acid-green)",
                    }}
                  >
                    {judgmentMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
