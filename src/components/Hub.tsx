"use client";

import Image from "next/image";
import type { Player, World } from "@/types/game";
import { worlds } from "@/data/worlds";

type HubProps = {
  players: Player[];
  onSelectWorld?: (world: World) => void;
};

const POSITIONS: Record<World["id"], string> = {
  world1: "col-start-2 row-start-1", // top
  world2: "col-start-2 row-start-3", // bottom
  world3: "col-start-1 row-start-2", // left
  world4: "col-start-3 row-start-2", // right
};

export default function Hub({ players, onSelectWorld }: HubProps) {
  const playersHere = players.filter((p) => p.location === "hub");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="y2k-window w-full max-w-2xl">
        <div className="y2k-window-title">
          <span>◆ HUB CENTRAL ◆</span>
          <span>★ TELEPORTEUR 3000 ★</span>
        </div>

        <div className="y2k-window-content">
          <h1 className="chrome-text text-2xl sm:text-3xl text-center mb-4">
            <span className="sparkle">CHOISIS TA DESTINATION</span>
          </h1>

          <div
            className="grid w-full aspect-square gap-3 sm:gap-4"
            style={{
              gridTemplateColumns: "1fr 1.4fr 1fr",
              gridTemplateRows: "1fr 1.4fr 1fr",
            }}
          >
            {worlds.map((world) => (
              <button
                key={world.id}
                type="button"
                onClick={() => onSelectWorld?.(world)}
                className={`${POSITIONS[world.id]} relative flex items-center justify-center overflow-hidden rounded-lg border-4 transition-transform hover:scale-105 active:scale-95`}
                style={{
                  borderColor: "var(--chrome-2)",
                  borderTopColor: "#fff",
                  borderLeftColor: "#fff",
                  boxShadow:
                    "4px 4px 0 rgba(0,0,0,0.6), 0 0 16px " + world.color,
                  backgroundColor: world.portalImage ? undefined : world.color,
                }}
              >
                {world.portalImage && (
                  <Image
                    src={world.portalImage}
                    alt={world.name}
                    fill
                    sizes="(max-width: 640px) 33vw, 220px"
                    className="object-cover"
                  />
                )}
                <span
                  className="relative z-10 font-bold text-center px-2 py-1 rounded text-sm sm:text-lg text-white"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    background: "rgba(0,0,0,0.55)",
                    border: "2px solid var(--acid-green)",
                    textShadow: "0 0 6px var(--acid-green)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {world.name}
                </span>
              </button>
            ))}

            {/* Spawn zone (center) */}
            <div className="col-start-2 row-start-2 flex flex-col items-center justify-center gap-3 rounded-lg p-4 y2k-window-content">
              <span className="y2k-label sparkle">SPAWN</span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {playersHere.map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="avatar-chrome">
                      {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it */}
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-8 h-8 sm:w-12 sm:h-12"
                      />
                    </span>
                    <span
                      className="text-xs font-medium max-w-[4rem] truncate"
                      style={{
                        fontFamily: "var(--font-terminal), monospace",
                        color: "var(--acid-green)",
                        textShadow: "0 0 4px var(--acid-green)",
                      }}
                    >
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
