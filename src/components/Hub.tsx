"use client";

import Image from "next/image";
import type { Player, World } from "@/types/game";
import { worlds } from "@/data/worlds";
import Reveal from "@/components/Reveal";

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
    <div className="page-shell page-enter items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="eyebrow">Hub central</span>
          <h1 className="page-title">Choisis ta destination</h1>
        </div>

        <div
          className="grid w-full aspect-square gap-3 sm:gap-4"
          style={{
            gridTemplateColumns: "1fr 1.4fr 1fr",
            gridTemplateRows: "1fr 1.4fr 1fr",
          }}
        >
          {worlds.map((world, index) => (
            <Reveal key={world.id} className={POSITIONS[world.id]} delay={index * 80}>
              <button
                type="button"
                onClick={() => onSelectWorld?.(world)}
                className="bento-card bento-card-interactive bento-card-compact relative flex flex-col w-full h-full items-center justify-center gap-2 overflow-hidden text-left"
              >
                {world.portalImage ? (
                  <div className="relative w-full flex-1 overflow-hidden rounded-2xl">
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
                    className="w-full flex-1 rounded-2xl"
                    style={{ backgroundColor: world.color }}
                  />
                )}
                <span className="section-title text-xs sm:text-sm text-center truncate w-full">
                  {world.name}
                </span>
              </button>
            </Reveal>
          ))}

          {/* Spawn zone (center) */}
          <Reveal className="col-start-2 row-start-2" delay={320}>
            <div className="bento-card-soft flex flex-col items-center justify-center gap-3 w-full h-full p-4">
              <span className="eyebrow">Spawn</span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {playersHere.map((player) => (
                  <div key={player.id} className="flex flex-col items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it */}
                    <img
                      src={player.image}
                      alt={player.name}
                      className="avatar-circle w-8 h-8 sm:w-12 sm:h-12"
                    />
                    <span className="text-xs font-medium max-w-[4rem] truncate" style={{ color: "var(--text-primary)" }}>
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
