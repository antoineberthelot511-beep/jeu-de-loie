import type { Player } from "@/types/game";
import { locationName } from "@/lib/locations";

type PlayersOverviewProps = {
  players: Player[];
};

export default function PlayersOverview({ players }: PlayersOverviewProps) {
  return (
    <div className="y2k-window w-full max-w-2xl mx-auto">
      <div className="y2k-window-title">
        <span>◆ VUE D&apos;ENSEMBLE ◆</span>
        <span>★ JOUEURS ★</span>
      </div>

      <div className="y2k-window-content space-y-3">
        {players.length === 0 ? (
          <p className="y2k-label text-center">// aucun joueur //</p>
        ) : (
          players.map((player) => (
            <div
              key={player.id}
              className="p-2 rounded-md"
              style={{
                background: "linear-gradient(135deg, #1a1a40, #06061a)",
                border: "2px solid var(--chrome-2)",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="avatar-chrome flex-shrink-0">
                  {player.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img src={player.image} alt={player.name} className="w-10 h-10" />
                  ) : (
                    <span
                      className="w-10 h-10 flex items-center justify-center text-xs rounded-full"
                      style={{
                        background: "#000",
                        color: "var(--acid-green)",
                        fontFamily: "var(--font-terminal), monospace",
                      }}
                    >
                      ?
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className="block text-sm font-medium truncate"
                    style={{ fontFamily: "var(--font-terminal), monospace", color: "#fff" }}
                  >
                    {player.name}
                  </span>
                  <span className="y2k-label">📍 {locationName(player.location)}</span>
                </div>

                <span
                  className="text-sm font-medium flex-shrink-0"
                  style={{ color: "var(--acid-green)", textShadow: "0 0 6px var(--acid-green)" }}
                >
                  💰 {player.money}
                </span>
              </div>

              {player.inventory.length > 0 ? (
                <div className="space-y-1">
                  {player.inventory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-1 rounded-md"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        border: "1px solid var(--chrome-2)",
                      }}
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded-md flex-shrink-0 border"
                          style={{ borderColor: "var(--chrome-2)" }}
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-xs"
                          style={{ background: "#000", border: "1px solid var(--chrome-2)" }}
                        >
                          ✦
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span
                          className="block text-xs font-medium truncate"
                          style={{ fontFamily: "var(--font-terminal), monospace", color: "#fff" }}
                        >
                          {item.name}
                        </span>
                        {(item.durability !== undefined || item.description) && (
                          <span
                            className="block text-xs truncate"
                            style={{ color: "var(--chrome-2)" }}
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
