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
    }));

    localStorage.setItem("players", JSON.stringify(players));
    onComplete?.(players);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-bold text-center">
          Configuration des joueurs
        </h1>

        <div className="space-y-4">
          {drafts.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-md"
            >
              <div className="flex-shrink-0">
                <label
                  htmlFor={`image-${player.id}`}
                  className="block w-16 h-16 rounded-full bg-gray-100 border border-gray-300 overflow-hidden cursor-pointer flex items-center justify-center text-xs text-gray-500 text-center"
                >
                  {player.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img
                      src={player.image}
                      alt={`Avatar joueur ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "Photo"
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
                <label className="block text-sm font-medium mb-1">
                  Joueur {index + 1}
                </label>
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handleNameChange(player.id, e.target.value)}
                  placeholder="Nom du joueur"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {drafts.length > MIN_PLAYERS && (
                <button
                  type="button"
                  onClick={() => handleRemovePlayer(player.id)}
                  className="text-gray-400 hover:text-red-600 text-xl leading-none"
                  aria-label={`Supprimer le joueur ${index + 1}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleAddPlayer}
            disabled={drafts.length >= MAX_PLAYERS}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajouter un joueur
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Démarrer la partie
          </button>
        </div>
      </form>
    </div>
  );
}
