"use client";

import { useEffect, useState } from "react";
import type { Item, Player } from "@/types/game";
import { locationName } from "@/lib/locations";
import Reveal from "@/components/Reveal";

type NarratorPlayerPanelProps = {
  players: Player[];
  onGiveItem: (playerId: string, item: Item) => boolean;
  onRemoveItem: (playerId: string, itemId: string) => void;
  onAdjustMoney: (playerId: string, amount: number) => void;
  onAdjustLife: (playerId: string, amount: number) => void;
  onSendMessage: (playerId: string, message: string) => void;
};

export default function NarratorPlayerPanel({
  players,
  onGiveItem,
  onRemoveItem,
  onAdjustMoney,
  onAdjustLife,
  onSendMessage,
}: NarratorPlayerPanelProps) {
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("10");
  const [itemName, setItemName] = useState("");
  const [itemImage, setItemImage] = useState<string | undefined>(undefined);
  const [itemDurability, setItemDurability] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemMessage, setItemMessage] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendConfirmation, setSendConfirmation] = useState<string | null>(null);

  const selected = players.find((p) => p.id === selectedId) ?? players[0];
  const selectedPlayerId = selected?.id;
  const selectedNarratorMessage = selected?.narratorMessage;

  // Resynchronise le brouillon de message uniquement quand on change de joueur
  // (pas à chaque mise à jour temps réel de `players`, pour ne pas écraser la saisie en cours).
  useEffect(() => {
    if (!selectedPlayerId) return;
    setMessageText(selectedNarratorMessage ?? "");
    setSendConfirmation(null);
  }, [selectedPlayerId, selectedNarratorMessage]);

  const parsedAmount = Number(amount) || 0;

  if (!selected) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full">
        <div className="bento-card w-full">
          <p className="body-text">Aucun joueur connecté.</p>
        </div>
      </div>
    );
  }

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") setItemImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleGiveItem = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = itemName.trim();
    if (!trimmedName) return;

    const parsedDurability = itemDurability.trim() === "" ? undefined : Number(itemDurability);

    const isCollective = onGiveItem(selected.id, {
      id: crypto.randomUUID(),
      name: trimmedName,
      price: 0,
      image: itemImage,
      durability:
        parsedDurability !== undefined && Number.isFinite(parsedDurability)
          ? parsedDurability
          : undefined,
      description: itemDescription.trim() || undefined,
    });

    setItemMessage(
      isCollective ? `Propriété collective : tout le monde reçoit ${trimmedName}.` : `${trimmedName} donné à ${selected.name}.`
    );

    setItemName("");
    setItemImage(undefined);
    setItemDurability("");
    setItemDescription("");
  };

  const handleSendMessage = () => {
    onSendMessage(selected.id, messageText.trim());
    setSendConfirmation("Message envoyé.");
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
      <Reveal>
        <div className="bento-card w-full flex flex-col gap-4">
          <div>
            <label className="field-label">Joueur</label>
            <select
              value={selected.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="input-field"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            {selected.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
              <img src={selected.image} alt={selected.name} className="avatar-circle w-16 h-16 flex-shrink-0" />
            ) : (
              <span className="avatar-placeholder w-16 h-16 flex-shrink-0">—</span>
            )}

            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="section-title truncate">{selected.name}</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {locationName(selected.location)}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="badge">{selected.money} roupies</span>
              <span className="badge badge-neutral">{selected.life} vie</span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="bento-card w-full flex flex-col gap-4">
          <h3 className="section-title">Vie &amp; argent</h3>

          <div>
            <label className="field-label">Quantité</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 10"
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="field-label">Vie</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAdjustLife(selected.id, parsedAmount)}
                className="btn-pill btn-pill-soft btn-pill-sm flex-1"
              >
                + Ajouter
              </button>
              <button
                type="button"
                onClick={() => onAdjustLife(selected.id, -parsedAmount)}
                className="btn-pill btn-pill-danger btn-pill-sm flex-1"
              >
                - Retirer
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="field-label">Argent</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAdjustMoney(selected.id, parsedAmount)}
                className="btn-pill btn-pill-soft btn-pill-sm flex-1"
              >
                + Ajouter
              </button>
              <button
                type="button"
                onClick={() => onAdjustMoney(selected.id, -parsedAmount)}
                className="btn-pill btn-pill-danger btn-pill-sm flex-1"
              >
                - Retirer
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="bento-card w-full flex flex-col gap-4">
          <h3 className="section-title">Objets</h3>

          <form onSubmit={handleGiveItem} className="flex flex-col gap-3">
            <div>
              <label className="field-label">Nom de l&apos;objet</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
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
                value={itemDurability}
                onChange={(e) => setItemDurability(e.target.value)}
                placeholder="Ex: 10"
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Caractéristiques</label>
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Ex: +5 attaque, brille dans le noir..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <button type="submit" className="btn-pill btn-pill-primary w-full">
              Donner
            </button>
          </form>

          {itemMessage && <p className="success-text">{itemMessage}</p>}

          <hr className="divider" />

          {selected.inventory.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selected.inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2"
                  style={{ background: "var(--bg-card-soft)" }}
                >
                  <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {item.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(selected.id, item.id)}
                    className="btn-pill btn-pill-danger btn-pill-sm"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="body-text">Inventaire vide.</p>
          )}
        </div>
      </Reveal>

      <Reveal delay={180}>
        <div className="bento-card w-full flex flex-col gap-3">
          <h3 className="section-title">Communiquer</h3>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Message qui s'affichera sur le téléphone du joueur..."
            rows={3}
            className="input-field resize-none"
          />
          <button type="button" onClick={handleSendMessage} className="btn-pill btn-pill-primary w-full">
            Envoyer
          </button>
          {sendConfirmation && <p className="success-text">{sendConfirmation}</p>}
        </div>
      </Reveal>
    </div>
  );
}
