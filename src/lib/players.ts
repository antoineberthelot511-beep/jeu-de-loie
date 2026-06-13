import type { Item, Player } from "@/types/game";

export type PlayerRow = {
  id: string;
  game_id: string;
  name: string;
  avatar: string | null;
  money: number;
  life: number | null;
  location: Player["location"];
  inventory: Item[] | null;
  narrator_message: string | null;
};

export function rowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    image: row.avatar ?? "",
    location: row.location ?? "hub",
    money: row.money ?? 0,
    life: row.life ?? 100,
    inventory: row.inventory ?? [],
    narratorMessage: row.narrator_message ?? null,
  };
}
