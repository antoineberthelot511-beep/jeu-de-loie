import type { Item, Player, World as WorldData } from "@/types/game";
import Shop from "@/components/Shop";
import Reveal from "@/components/Reveal";

type WorldProps = {
  world: WorldData;
  players: Player[];
  shopItems?: Item[];
  onAddShopItem?: (item: Item) => void;
  onBuyShopItem?: (item: Item) => boolean;
};

export default function World({
  world,
  players,
  shopItems,
  onAddShopItem,
  onBuyShopItem,
}: WorldProps) {
  const playersHere = players.filter((p) => p.location === world.id);

  return (
    <div className="page-shell page-enter items-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="eyebrow">Monde</span>
          <h1 className="page-title">{world.name}</h1>
        </div>

        <Reveal className="w-full">
          <div className="bento-card w-full">
            <span className="field-label">Présents ici</span>
            {playersHere.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {playersHere.map((player) => (
                  <div key={player.id} className="flex flex-col items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it */}
                    <img
                      src={player.image}
                      alt={player.name}
                      className="avatar-circle w-12 h-12 sm:w-14 sm:h-14"
                    />
                    <span className="text-xs font-medium max-w-[4rem] truncate" style={{ color: "var(--text-primary)" }}>
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="body-text pt-2">Zone vide pour le moment.</p>
            )}
          </div>
        </Reveal>

        {/* Market shop, Capitaliste Land only */}
        {world.id === "world2" && onAddShopItem && onBuyShopItem && (
          <Reveal className="w-full" delay={100}>
            <Shop
              shopItems={shopItems ?? []}
              onAddItem={onAddShopItem}
              onBuy={onBuyShopItem}
            />
          </Reveal>
        )}
      </div>
    </div>
  );
}
