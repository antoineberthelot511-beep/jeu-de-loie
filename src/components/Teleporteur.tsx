import type { Player } from "@/types/game";
import { worlds } from "@/data/worlds";

type Destination = {
  id: Player["location"];
  name: string;
  color: string;
};

const DESTINATIONS: Destination[] = [
  { id: "hub", name: "Spawn", color: "var(--bg-card-soft)" },
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
    <div className="glass-bar glass-bar-bottom">
      <div className="glass-bar-inner" style={{ maxHeight: "45vh", overflowY: "auto" }}>
        <span className="eyebrow text-center">Téléporteur</span>

        <div className="flex flex-wrap justify-center gap-2">
          {DESTINATIONS.map((dest) => {
            const isActive = currentPlayer?.location === dest.id;

            return isActive ? (
              <span key={dest.id} className="badge">
                {dest.name}
              </span>
            ) : (
              <button
                key={dest.id}
                type="button"
                onClick={() => onTeleport(dest.id)}
                className="btn-pill btn-pill-secondary btn-pill-sm"
              >
                {dest.name}
              </button>
            );
          })}
        </div>

        <hr className="divider" />

        <div className="flex flex-col items-center gap-1">
          <span className="eyebrow">Qui est où</span>
          <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            {players.map((player) => (
              <li key={player.id} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{player.name}</span>
                {" · "}
                {locationName(player.location)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
