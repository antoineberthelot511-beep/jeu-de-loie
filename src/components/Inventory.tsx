"use client";

import { useState } from "react";
import type { Player } from "@/types/game";

type InventoryProps = {
  player?: Player;
};

export default function Inventory({ player }: InventoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[10000]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="y2k-btn y2k-btn-chrome"
      >
        🎒 Inventaire
      </button>

      {open && (
        <div className="y2k-window mt-2 w-64 max-h-[70vh] overflow-y-auto">
          <div className="y2k-window-title">
            <span>◆ INVENTAIRE ◆</span>
          </div>

          <div className="y2k-window-content space-y-3">
            <h3 className="chrome-text text-center text-lg">
              {player?.name ?? "Joueur"}
            </h3>
            <p
              className="text-center text-base font-medium"
              style={{ color: "var(--acid-green)", textShadow: "0 0 6px var(--acid-green)" }}
            >
              💰 {player?.money ?? 0} roupies
            </p>

            <hr className="chrome-divider" />

            <div className="space-y-2">
              {player && player.inventory.length > 0 ? (
                player.inventory.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center gap-2 p-2 rounded-md"
                    style={{
                      background: "linear-gradient(135deg, #1a1a40, #06061a)",
                      border: "2px solid var(--chrome-2)",
                      boxShadow: "2px 2px 0 rgba(0,0,0,0.6)",
                    }}
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-md flex-shrink-0 border-2"
                        style={{ borderColor: "var(--chrome-2)" }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: "#000", border: "2px solid var(--chrome-2)" }}
                      >
                        ✦
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span
                        className="block text-sm font-medium truncate"
                        style={{ fontFamily: "var(--font-terminal), monospace", color: "#fff" }}
                      >
                        {item.name}
                      </span>
                      {item.durability !== undefined && (
                        <span
                          className="block text-xs"
                          style={{ color: "var(--acid-green)", textShadow: "0 0 4px var(--acid-green)" }}
                        >
                          ⚙ Durabilité : {item.durability}
                        </span>
                      )}
                      {item.description && (
                        <span
                          className="block text-xs"
                          style={{ fontFamily: "var(--font-terminal), monospace", color: "var(--chrome-2)" }}
                        >
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="y2k-label text-center">// inventaire vide //</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
