import type { Player } from "@/types/game";
import { worlds } from "@/data/worlds";
import TitleBar from "@/components/TitleBar";

type Destination = {
  id: Player["location"];
  name: string;
  color: string;
};

const DESTINATIONS: Destination[] = [
  { id: "hub", name: "Spawn", color: "var(--chrome-2)" },
  ...worlds.map((world) => ({
    id: world.id,
    name: world.name,
    color: world.color,
  })),
];

function locationName(location: Player["location"]): string {
  return DESTINATIONS.find((d) => d.id === location)?.name ?? location;
}

type TeleporteurProps = {
  players: Player[];
  currentPlayer?: Player;
  onTeleport: (destination: Player["location"]) => void;
};

export default function Teleporteur({
  players,
  currentPlayer,
  onTeleport,
}: TeleporteurProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9000] px-2 pb-2 sm:px-4 sm:pb-4 pointer-events-none">
      <div className="y2k-window w-full max-w-2xl mx-auto pointer-events-auto max-h-[45vh] flex flex-col">
        <TitleBar title="Téléporteur - Destinations" />

        <div className="y2k-window-content space-y-3 overflow-y-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {DESTINATIONS.map((dest) => {
              const isActive = currentPlayer?.location === dest.id;

              return isActive ? (
                <span
                  key={dest.id}
                  className="glass-item-sm y2k-btn-sm"
                >
                  ▶ {dest.name} ◀
                </span>
              ) : (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => onTeleport(dest.id)}
                  className="y2k-btn y2k-btn-sm"
                >
                  {dest.name}
                </button>
              );
            })}
          </div>

          <hr className="chrome-divider my-1" />

          <div className="space-y-1">
            <p className="y2k-label text-center">Qui est où</p>
            <ul className="flex flex-wrap justify-center gap-x-3 gap-y-0.5">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-terminal), monospace",
                    color: "var(--text-strong)",
                  }}
                >
                  <span style={{ color: "var(--acid-green)" }}>
                    {player.name}
                  </span>
                  {" → "}
                  <span style={{ color: "var(--magenta)" }}>
                    {locationName(player.location)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
