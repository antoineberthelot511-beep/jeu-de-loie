"use client";

import { useState } from "react";
import type { Player } from "@/types/game";
import Reveal from "@/components/Reveal";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

type DraftPlayer = {
  id: string;
  name: string;
  image: string;
};

function createDraftPlayer(): DraftPlayer {
  return { id: crypto.randomUUID(), name: "", image: "" };
}

type PlayerSetupProps = {
  onComplete?: (players: Player[]) => void;
};

export default function PlayerSetup({ onComplete }: PlayerSetupProps) {
  const [drafts, setDrafts] = useState<DraftPlayer[]>(() => [
    createDraftPlayer(),
    createDraftPlayer(),
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleAddPlayer = () => {
    if (drafts.length >= MAX_PLAYERS) return;
    setDrafts((prev) => [...prev, createDraftPlayer()]);
  };

  const handleRemovePlayer = (id: string) => {
    if (drafts.length <= MIN_PLAYERS) return;
    setDrafts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleNameChange = (id: string, name: string) => {
    setDrafts((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleImageChange = (id: string, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setDrafts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, image: result } : p))
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (drafts.some((p) => p.name.trim() === "")) {
      setError("Chaque joueur doit avoir un nom.");
      return;
    }
    if (drafts.some((p) => p.image === "")) {
      setError("Chaque joueur doit avoir une image.");
      return;
    }

    setError(null);

    const players: Player[] = drafts.map((p) => ({
      id: p.id,
      name: p.name.trim(),
      image: p.image,
      location: "hub",
      money: 100,
      life: 100,
      inventory: [],
      posX: 50,
      posY: 50,
      croqueCount: 0,
    }));

    localStorage.setItem("players", JSON.stringify(players));
    onComplete?.(players);
  };

  return (
    <div className="page-shell page-enter items-center justify-center px-4 py-12 sm:px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="eyebrow">Nouvelle partie</span>
          <h1 className="page-title">Configuration des joueurs</h1>
        </div>

        <div className="w-full flex flex-col gap-3">
          {drafts.map((player, index) => (
            <Reveal key={player.id} delay={index * 60}>
              <div className="bento-card flex items-center gap-4">
                <div className="flex-shrink-0">
                  <label htmlFor={`image-${player.id}`} className="cursor-pointer">
                    {player.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                      <img
                        src={player.image}
                        alt={`Avatar joueur ${index + 1}`}
                        className="avatar-circle w-16 h-16"
                      />
                    ) : (
                      <span className="avatar-placeholder w-16 h-16">Photo</span>
                    )}
                  </label>
                  <input
                    id={`image-${player.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(player.id, e.target.files?.[0])}
                  />
                </div>

                <div className="flex-1">
                  <label className="field-label">Joueur {index + 1}</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleNameChange(player.id, e.target.value)}
                    placeholder="Nom du joueur"
                    className="input-field"
                  />
                </div>

                {drafts.length > MIN_PLAYERS && (
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="btn-pill btn-pill-danger btn-pill-sm"
                    aria-label={`Supprimer le joueur ${index + 1}`}
                  >
                    Retirer
                  </button>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {error && <p className="danger-text">{error}</p>}

        <div className="flex w-full items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleAddPlayer}
            disabled={drafts.length >= MAX_PLAYERS}
            className="btn-link"
          >
            + Ajouter un joueur
          </button>
          <button type="submit" className="btn-pill btn-pill-primary">
            Démarrer la partie
          </button>
        </div>
      </form>
    </div>
  );
}
