import Image from "next/image";
import type { Player, World as WorldData } from "@/types/game";

type WorldProps = {
  world: WorldData;
  players: Player[];
};

export default function World({ world, players }: WorldProps) {
  const playersHere = players.filter((p) => p.location === world.id);

  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 shadow-md border-2 min-h-[10rem] sm:min-h-[14rem]"
      style={{
        borderColor: world.color,
        backgroundColor: world.sceneImage ? undefined : `${world.color}1a`,
      }}
    >
      {world.sceneImage && (
        <Image
          src={world.sceneImage}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 25vw"
          className="object-cover z-0"
        />
      )}

      <div className="relative z-10 flex flex-col gap-3">
        <h2
          className="font-bold text-base sm:text-lg w-fit"
          style={{
            color: world.sceneImage ? "#fff" : world.color,
            backgroundColor: world.sceneImage ? "rgba(0,0,0,0.4)" : undefined,
            padding: world.sceneImage ? "0.125rem 0.5rem" : undefined,
            borderRadius: world.sceneImage ? "0.25rem" : undefined,
          }}
        >
          {world.name}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {playersHere.length === 0 ? (
            <span
              className="text-sm"
              style={{ color: world.sceneImage ? "#fff" : "#9ca3af" }}
            >
              Aucun joueur ici
            </span>
          ) : (
            playersHere.map((player) => (
              <div
                key={player.id}
                className="flex flex-col items-center gap-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it */}
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-lg"
                />
                <span
                  className="text-xs font-medium max-w-[4rem] truncate"
                  style={{
                    color: world.sceneImage ? "#fff" : "#374151",
                    textShadow: world.sceneImage
                      ? "0 1px 2px rgba(0,0,0,0.8)"
                      : undefined,
                  }}
                >
                  {player.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
