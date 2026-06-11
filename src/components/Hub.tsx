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
      <div
        className="grid w-full max-w-2xl aspect-square gap-3 sm:gap-4"
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
            className={`${POSITIONS[world.id]} relative flex items-center justify-center overflow-hidden rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95`}
            style={world.portalImage ? undefined : { backgroundColor: world.color }}
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
            <span className="relative z-10 bg-black/40 text-white font-bold text-center px-2 py-1 rounded text-sm sm:text-lg">
              {world.name}
            </span>
          </button>
        ))}

        {/* Spawn zone (center) */}
        <div className="col-start-2 row-start-2 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4">
          <span className="text-sm font-medium text-gray-500">Spawn</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {playersHere.map((player) => (
              <div
                key={player.id}
                className="flex flex-col items-center gap-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it */}
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow"
                />
                <span className="text-xs font-medium text-gray-700 max-w-[4rem] truncate">
                  {player.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
