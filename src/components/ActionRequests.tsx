import type { Player } from "@/types/game";
import type { ActionRequest } from "@/hooks/useActionRequests";
import Reveal from "@/components/Reveal";

type ActionRequestsProps = {
  requests: ActionRequest[];
  players: Player[];
  onResolve: (requestId: string) => void;
};

export default function ActionRequests({ requests, players, onResolve }: ActionRequestsProps) {
  return (
    <Reveal className="w-full max-w-2xl mx-auto">
      <div className="bento-card w-full flex flex-col gap-3">
        <h2 className="section-title">Demandes des joueurs</h2>

        {requests.length === 0 ? (
          <p className="body-text">Aucune demande en attente.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {requests.map((request) => {
              const player = players.find((p) => p.id === request.player_id);

              return (
                <div key={request.id} className="bento-card-soft flex items-center gap-3">
                  <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                    <span className="eyebrow">{player?.name ?? "Joueur inconnu"}</span>
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {request.content}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onResolve(request.id)}
                    className="btn-pill btn-pill-soft btn-pill-sm flex-shrink-0"
                  >
                    Traiter
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Reveal>
  );
}
