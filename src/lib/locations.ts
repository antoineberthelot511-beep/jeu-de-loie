import type { Player } from "@/types/game";
import { worlds } from "@/data/worlds";

export const DESTINATIONS: { id: Player["location"]; name: string; color: string }[] = [
  { id: "hub", name: "Spawn", color: "var(--chrome-2)" },
  ...worlds.map((world) => ({ id: world.id, name: world.name, color: world.color })),
];

export function locationName(location: Player["location"]): string {
  return DESTINATIONS.find((d) => d.id === location)?.name ?? location;
}
