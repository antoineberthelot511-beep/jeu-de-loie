'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type ConnectedPlayer = {
  id: string;
  name: string;
  avatar: string | null;
};

export default function HostPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<ConnectedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the game by its code and load the players already connected
  useEffect(() => {
    if (!code) return;
    let active = true;

    const load = async () => {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (!active) return;

      if (gameError || !game) {
        setError('Partie introuvable');
        setLoading(false);
        return;
      }

      setGameId(game.id);

      const { data: existingPlayers } = await supabase
        .from('players')
        .select('id, name, avatar')
        .eq('game_id', game.id);

      if (!active) return;
      setPlayers(existingPlayers ?? []);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [code]);

  // Realtime: react to players joining/leaving the game
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`host-players-${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPlayer = payload.new as ConnectedPlayer;
            setPlayers((prev) =>
              prev.some((p) => p.id === newPlayer.id) ? prev : [...prev, newPlayer]
            );
          } else if (payload.eventType === 'UPDATE') {
            const updatedPlayer = payload.new as ConnectedPlayer;
            setPlayers((prev) =>
              prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedPlayer = payload.old as ConnectedPlayer;
            setPlayers((prev) => prev.filter((p) => p.id !== deletedPlayer.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const handleStartGame = () => {
    // TODO: branché en phase 3
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="y2k-window w-full max-w-md">
        <div className="y2k-window-title">
          <span>◆ NARRATEUR ◆</span>
          <span>★ SALLE D&apos;ATTENTE ★</span>
        </div>

        <div className="y2k-window-content space-y-6">
          {error ? (
            <p
              className="text-center text-sm"
              style={{
                fontFamily: 'var(--font-display), sans-serif',
                color: 'var(--magenta)',
                textShadow: '0 0 8px var(--magenta)',
              }}
            >
              ⚠ {error} ⚠
            </p>
          ) : (
            <>
              <div className="text-center">
                <p className="y2k-label mb-2">Code de la partie</p>
                <p className="chrome-text text-5xl sm:text-6xl tracking-[0.3em]">
                  <span className="sparkle">{code}</span>
                </p>
              </div>

              <hr className="chrome-divider" />

              <div>
                <h2 className="chrome-text text-lg text-center mb-2">
                  <span className="sparkle">Joueurs connectés ({players.length})</span>
                </h2>

                {loading ? (
                  <p className="y2k-label text-center">// chargement... //</p>
                ) : players.length === 0 ? (
                  <p className="y2k-label text-center">// en attente de joueurs... //</p>
                ) : (
                  <div className="space-y-2">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 p-2 rounded-md"
                        style={{
                          background: 'linear-gradient(135deg, #1a1a40, #06061a)',
                          border: '2px solid var(--chrome-2)',
                          boxShadow: '2px 2px 0 rgba(0,0,0,0.6)',
                        }}
                      >
                        <div className="avatar-chrome flex-shrink-0">
                          {player.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-10 h-10"
                            />
                          ) : (
                            <span
                              className="w-10 h-10 flex items-center justify-center text-xs rounded-full"
                              style={{
                                background: '#000',
                                color: 'var(--acid-green)',
                                fontFamily: 'var(--font-terminal), monospace',
                              }}
                            >
                              ?
                            </span>
                          )}
                        </div>
                        <span
                          className="text-sm font-medium truncate"
                          style={{ fontFamily: 'var(--font-terminal), monospace', color: '#fff' }}
                        >
                          {player.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="chrome-divider" />

              <button
                type="button"
                onClick={handleStartGame}
                className="y2k-btn y2k-btn-green w-full"
              >
                ▶ Démarrer la partie
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
