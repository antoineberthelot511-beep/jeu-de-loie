"use client";

import Image from "next/image";
import type { Player } from "@/types/game";
import { worlds } from "@/data/worlds";
import Reveal from "@/components/Reveal";

type NarratorMapsProps = {
  players: Player[];
};

export default function NarratorMaps({ players }: NarratorMapsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {worlds.map((world, index) => {
        const here = players.filter((p) => p.location === world.id);

        return (
          <Reveal key={world.id} delay={index * 80}>
            <div className="relative w-full aspect-[4/3] rounded-[22px] overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              {world.sceneImage ? (
                <Image
                  src={world.sceneImage}
                  alt={world.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: world.color }} />
              )}

              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0) 55%)" }}
              />

              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <span className="section-title" style={{ color: "#ffffff" }}>
                  {world.name}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {here.length > 0 ? (
                    here.map((player) => (
                      <div key={player.id} className="flex flex-col items-center gap-1">
                        {player.image ? (
                          // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                          <img
                            src={player.image}
                            alt={player.name}
                            className="avatar-circle w-9 h-9"
                            style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.85)" }}
                          />
                        ) : (
                          <span
                            className="avatar-placeholder w-9 h-9"
                            style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.85)" }}
                          >
                            —
                          </span>
                        )}
                        <span className="text-xs font-medium max-w-[4rem] truncate" style={{ color: "#ffffff" }}>
                          {player.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="badge" style={{ background: "rgba(255,255,255,0.18)", color: "#ffffff" }}>
                      Vide
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
