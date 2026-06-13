"use client";

import { useState } from "react";
import type { Player } from "@/types/game";

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
      inventory: [],
    }));

    localStorage.setItem("players", JSON.stringify(players));
    onComplete?.(players);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="y2k-window w-full max-w-2xl">
        <div className="y2k-window-title">
          <span>◆ SETUP ◆</span>
          <span>★ NOUVELLE PARTIE ★</span>
        </div>

        <div className="y2k-window-content space-y-6">
          <h1 className="chrome-text text-2xl sm:text-3xl text-center">
            <span className="sparkle">CONFIGURATION DES JOUEURS</span>
          </h1>

          <div className="space-y-4">
            {drafts.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-4 p-3 rounded-md"
                style={{
                  background: "linear-gradient(135deg, #1a1a40, #06061a)",
                  border: "2px solid var(--chrome-2)",
                  boxShadow: "3px 3px 0 rgba(0,0,0,0.6)",
                }}
              >
                <div className="flex-shrink-0">
                  <label
                    htmlFor={`image-${player.id}`}
                    className="avatar-chrome cursor-pointer"
                  >
                    {player.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                      <img
                        src={player.image}
                        alt={`Avatar joueur ${index + 1}`}
                        className="w-16 h-16"
                      />
                    ) : (
                      <span
                        className="w-16 h-16 flex items-center justify-center text-xs text-center rounded-full"
                        style={{
                          background: "#000",
                          color: "var(--acid-green)",
                          fontFamily: "var(--font-terminal), monospace",
                        }}
                      >
                        PHOTO
                      </span>
                    )}
                  </label>
                  <input
                    id={`image-${player.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageChange(player.id, e.target.files?.[0])
                    }
                  />
                </div>

                <div className="flex-1">
                  <label className="y2k-label block mb-1">
                    Joueur {index + 1}
                  </label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleNameChange(player.id, e.target.value)}
                    placeholder="Nom du joueur"
                    className="y2k-input w-full"
                  />
                </div>

                {drafts.length > MIN_PLAYERS && (
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="y2k-btn y2k-btn-magenta"
                    style={{ padding: "0.4rem 0.7rem", fontSize: "1rem" }}
                    aria-label={`Supprimer le joueur ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p
              className="text-center text-sm"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                color: "var(--magenta)",
                textShadow: "0 0 8px var(--magenta)",
              }}
            >
              ⚠ {error} ⚠
            </p>
          )}

          <hr className="chrome-divider" />

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleAddPlayer}
              disabled={drafts.length >= MAX_PLAYERS}
              className="y2k-btn y2k-btn-chrome"
            >
              ＋ Ajouter un joueur
            </button>
            <button type="submit" className="y2k-btn y2k-btn-green">
              ▶ Démarrer la partie
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
