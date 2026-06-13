"use client";

import { useState } from "react";
import type { Player } from "@/types/game";

type InventoryProps = {
  player?: Player;
};

export default function Inventory({ player }: InventoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10000]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="btn-pill btn-pill-glass"
      >
        Inventaire
      </button>

      {open && (
        <div className="floating-panel bento-card mt-3 w-72 max-h-[75vh] overflow-y-auto flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="section-title">{player?.name ?? "Joueur"}</h3>
            <span className="badge">{player?.money ?? 0} roupies</span>
          </div>

          <hr className="divider" />

          <div className="flex flex-col gap-2">
            {player && player.inventory.length > 0 ? (
              player.inventory.map((item, index) => (
                <div key={`${item.id}-${index}`} className="bento-card-soft flex items-center gap-3">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="avatar-placeholder w-10 h-10 rounded-xl flex-shrink-0">—</div>
                  )}
                  <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </span>
                    {item.durability !== undefined && (
                      <span className="text-xs" style={{ color: "var(--accent)" }}>
                        Durabilité {item.durability}
                      </span>
                    )}
                    {item.description && (
                      <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="body-text text-center">Inventaire vide.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
