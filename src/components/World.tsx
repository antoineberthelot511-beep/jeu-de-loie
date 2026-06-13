import type { Item, Player, World as WorldData } from "@/types/game";
import Shop from "@/components/Shop";

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
    <div className="min-h-screen w-full flex flex-col items-center p-2 sm:p-4">
      <div className="y2k-window w-full max-w-2xl">
        <div className="y2k-window-title">
          <span>◆ ZONE ◆</span>
          <span className="chrome-text">{world.name}</span>
          <span>◆ {world.id.toUpperCase()} ◆</span>
        </div>

        <div className="y2k-window-content flex flex-col items-center gap-4">
          <h2 className="chrome-text text-2xl sm:text-3xl text-center">
            <span className="sparkle">{world.name}</span>
          </h2>

          <hr className="chrome-divider w-full" />

          {/* Avatars */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full min-h-[4rem]">
            {playersHere.length > 0 ? (
              playersHere.map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="avatar-chrome">
                    {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it */}
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-10 h-10 sm:w-14 sm:h-14"
                    />
                  </span>
                  <span
                    className="text-xs font-medium max-w-[4rem] truncate"
                    style={{
                      fontFamily: "var(--font-terminal), monospace",
                      color: "var(--acid-green)",
                      textShadow: "0 0 4px var(--acid-green)",
                    }}
                  >
                    {player.name}
                  </span>
                </div>
              ))
            ) : (
              <p className="y2k-label">// zone vide //</p>
            )}
          </div>

          {/* Market shop, Capitaliste Land only */}
          {world.id === "world2" && onAddShopItem && onBuyShopItem && (
            <>
              <hr className="chrome-divider w-full" />
              <Shop
                shopItems={shopItems ?? []}
                onAddItem={onAddShopItem}
                onBuy={onBuyShopItem}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
