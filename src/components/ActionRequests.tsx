import type { Player } from "@/types/game";
import type { ActionRequest } from "@/hooks/useActionRequests";
import TitleBar from "@/components/TitleBar";

type ActionRequestsProps = {
  requests: ActionRequest[];
  players: Player[];
  onResolve: (requestId: string) => void;
};

export default function ActionRequests({ requests, players, onResolve }: ActionRequestsProps) {
  return (
    <div className="y2k-window w-full max-w-2xl mx-auto">
      <TitleBar title="Demandes des joueurs" />

      <div className="y2k-window-content space-y-2">
        {requests.length === 0 ? (
          <p className="y2k-label text-center">// aucune demande en attente //</p>
        ) : (
          requests.map((request) => {
            const player = players.find((p) => p.id === request.player_id);

            return (
              <div
                key={request.id}
                className="glass-item flex items-center gap-2 p-2"
              >
                <div className="min-w-0 flex-1">
                  <span
                    className="block text-xs"
                    style={{
                      color: "var(--acid-green)",
                      fontFamily: "var(--font-display), sans-serif",
                    }}
                  >
                    {player?.name ?? "Joueur inconnu"}
                  </span>
                  <span
                    className="block text-sm"
                    style={{ fontFamily: "var(--font-terminal), monospace", color: "var(--text-strong)" }}
                  >
                    {request.content}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onResolve(request.id)}
                  className="y2k-btn y2k-btn-green y2k-btn-sm flex-shrink-0"
                >
                  ✓ Traiter
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
