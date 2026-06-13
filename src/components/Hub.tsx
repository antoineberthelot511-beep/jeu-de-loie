"use client";

import Image from "next/image";
import type { Player, World } from "@/types/game";
import { worlds } from "@/data/worlds";
import TitleBar from "@/components/TitleBar";

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
        <TitleBar title="Hub central - Téléporteur 3000" />

        <div className="y2k-window-content">
          <h1 className="chrome-text text-2xl sm:text-3xl text-center mb-4">
            CHOISIS TA DESTINATION
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
                className={`${POSITIONS[world.id]} relative flex flex-col w-full h-full items-center justify-center gap-1 overflow-hidden p-1`}
              >
                {world.portalImage ? (
                  <div className="glass-placeholder relative w-full flex-1 overflow-hidden">
                    <Image
                      src={world.portalImage}
                      alt={world.name}
                      fill
                      sizes="(max-width: 640px) 33vw, 220px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="glass-placeholder w-full flex-1"
                    style={{ backgroundColor: world.color }}
                  />
                )}
                <span className="chrome-text text-xs sm:text-sm text-center truncate w-full">
                  {world.name}
                </span>
              </button>
            ))}

            {/* Spawn zone (center) */}
            <div className="col-start-2 row-start-2 flex flex-col items-center justify-center gap-3 p-4 glass-item">
              <span className="y2k-label">SPAWN</span>
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
