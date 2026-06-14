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
  pos_x: number | null;
  pos_y: number | null;
  croque_count: number | null;
  node_index: number | null;
  combat_action: string | null;
  in_goulag: boolean | null;
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
    posX: row.pos_x ?? 50,
    posY: row.pos_y ?? 50,
    croqueCount: row.croque_count ?? 0,
    nodeIndex: row.node_index ?? 0,
    combatAction: (row.combat_action as Player["combatAction"]) ?? null,
    inGoulag: row.in_goulag ?? false,
  };
}
