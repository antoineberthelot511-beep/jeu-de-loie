import type { Player } from "@/types/game";
import { locationName } from "@/lib/locations";
import TitleBar from "@/components/TitleBar";

type PlayersOverviewProps = {
  players: Player[];
};

export default function PlayersOverview({ players }: PlayersOverviewProps) {
  return (
    <div className="y2k-window w-full max-w-2xl mx-auto">
      <TitleBar title="Vue d'ensemble - Joueurs" />

      <div className="y2k-window-content space-y-3">
        {players.length === 0 ? (
          <p className="y2k-label text-center">// aucun joueur //</p>
        ) : (
          players.map((player) => (
            <div key={player.id} className="glass-item p-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="avatar-chrome flex-shrink-0">
                  {player.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img src={player.image} alt={player.name} className="w-10 h-10" />
                  ) : (
                    <span
                      className="glass-placeholder w-10 h-10 flex items-center justify-center text-xs rounded-full"
                      style={{ fontFamily: "var(--font-terminal), monospace" }}
                    >
                      ?
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className="block text-sm font-medium truncate"
                    style={{ fontFamily: "var(--font-terminal), monospace", color: "var(--text-strong)" }}
                  >
                    {player.name}
                  </span>
                  <span className="y2k-label">📍 {locationName(player.location)}</span>
                </div>

                <span
                  className="text-sm font-medium flex-shrink-0"
                  style={{ color: "var(--acid-green)" }}
                >
                  💰 {player.money}
                </span>
              </div>

              {player.inventory.length > 0 ? (
                <div className="space-y-1">
                  {player.inventory.map((item) => (
                    <div key={item.id} className="glass-item-sm flex items-center gap-2 p-1">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded-md flex-shrink-0 border"
                          style={{ borderColor: "rgba(255,255,255,0.6)" }}
                        />
                      ) : (
                        <div className="glass-placeholder w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-xs">
                          ✦
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span
                          className="block text-xs font-medium truncate"
                          style={{ fontFamily: "var(--font-terminal), monospace", color: "var(--text-strong)" }}
                        >
                          {item.name}
                        </span>
                        {(item.durability !== undefined || item.description) && (
                          <span
                            className="block text-xs truncate"
                            style={{ color: "var(--text-soft)" }}
                          >
                            {item.durability !== undefined && `⚙ ${item.durability}`}
                            {item.durability !== undefined && item.description && " — "}
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="y2k-label text-center text-xs">// inventaire vide //</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
