import type { Player } from "@/types/game";
import { locationName } from "@/lib/locations";
import Reveal from "@/components/Reveal";

type PlayersOverviewProps = {
  players: Player[];
};

export default function PlayersOverview({ players }: PlayersOverviewProps) {
  return (
    <Reveal className="w-full max-w-2xl mx-auto">
      <div className="bento-card w-full flex flex-col gap-3">
        <h2 className="section-title">Joueurs</h2>

        {players.length === 0 ? (
          <p className="body-text">Aucun joueur.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {players.map((player) => (
              <div key={player.id} className="bento-card-soft flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {player.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img src={player.image} alt={player.name} className="avatar-circle w-10 h-10 flex-shrink-0" />
                  ) : (
                    <span className="avatar-placeholder w-10 h-10 flex-shrink-0">—</span>
                  )}

                  <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {player.name}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {locationName(player.location)}
                    </span>
                  </div>

                  <span className="badge flex-shrink-0">{player.money}</span>
                </div>

                {player.inventory.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {player.inventory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-xl px-3 py-1.5"
                        style={{ background: "var(--bg-card)" }}
                      >
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="avatar-placeholder w-8 h-8 rounded-lg flex-shrink-0 text-xs">—</div>
                        )}
                        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                          <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                            {item.name}
                          </span>
                          {(item.durability !== undefined || item.description) && (
                            <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                              {item.durability !== undefined && `Durabilité ${item.durability}`}
                              {item.durability !== undefined && item.description && " — "}
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="body-text text-xs">Inventaire vide.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}
