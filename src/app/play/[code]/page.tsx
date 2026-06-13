'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useGameStatus } from '@/hooks/useGameStatus';
import { useRealtimePlayer } from '@/hooks/useRealtimePlayer';

export default function PlayPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { status, loading: statusLoading, error: statusError } = useGameStatus(code);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const storedGameId = localStorage.getItem('gameId');
    const storedPlayerId = localStorage.getItem('playerId');

    if (!storedGameId || !storedPlayerId) {
      setLocalError("Aucune partie en cours sur cet appareil.");
      return;
    }

    setPlayerId(storedPlayerId);
  }, []);

  const { player, loading: playerLoading } = useRealtimePlayer(playerId);

  const loading = statusLoading || playerLoading;
  const error = localError ?? statusError;

  return (
    <div className="min-h-screen flex items-center justify-center p-3">
      <div className="y2k-window w-full max-w-sm">
        <div className="y2k-window-title">
          <span>◆ JOUEUR ◆</span>
          <span>★ {code} ★</span>
        </div>

        <div className="y2k-window-content space-y-6 text-center">
          {loading ? (
            <p className="y2k-label text-center">// chargement... //</p>
          ) : error ? (
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
          ) : !player ? (
            <p
              className="text-center text-sm"
              style={{
                fontFamily: 'var(--font-display), sans-serif',
                color: 'var(--magenta)',
                textShadow: '0 0 8px var(--magenta)',
              }}
            >
              ⚠ Joueur introuvable ⚠
            </p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3">
                <div className="avatar-chrome">
                  {player.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-24 h-24 sm:w-28 sm:h-28"
                    />
                  ) : (
                    <span
                      className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-sm rounded-full"
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

                <h1 className="chrome-text text-2xl sm:text-3xl">
                  <span className="sparkle">{player.name}</span>
                </h1>

                <p
                  className="text-base font-medium"
                  style={{ color: 'var(--acid-green)', textShadow: '0 0 6px var(--acid-green)' }}
                >
                  💰 {player.money} roupies
                </p>
              </div>

              <hr className="chrome-divider" />

              {status === 'lobby' ? (
                <p className="y2k-label text-center text-sm leading-relaxed">
                  <span className="sparkle">
                    En attente que le narrateur démarre la partie...
                  </span>
                </p>
              ) : (
                <div className="space-y-2 text-left">
                  <h2 className="chrome-text text-lg text-center mb-2">
                    <span className="sparkle">Inventaire</span>
                  </h2>

                  {player.inventory.length > 0 ? (
                    player.inventory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-md"
                        style={{
                          background: 'linear-gradient(135deg, #1a1a40, #06061a)',
                          border: '2px solid var(--chrome-2)',
                          boxShadow: '2px 2px 0 rgba(0,0,0,0.6)',
                        }}
                      >
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-md flex-shrink-0 border-2"
                            style={{ borderColor: 'var(--chrome-2)' }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: '#000', border: '2px solid var(--chrome-2)' }}
                          >
                            ✦
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <span
                            className="block text-sm font-medium truncate"
                            style={{ fontFamily: 'var(--font-terminal), monospace', color: '#fff' }}
                          >
                            {item.name}
                          </span>
                          {item.durability !== undefined && (
                            <span
                              className="block text-xs"
                              style={{ color: 'var(--acid-green)', textShadow: '0 0 4px var(--acid-green)' }}
                            >
                              ⚙ Durabilité : {item.durability}
                            </span>
                          )}
                          {item.description && (
                            <span
                              className="block text-xs"
                              style={{ fontFamily: 'var(--font-terminal), monospace', color: 'var(--chrome-2)' }}
                            >
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="y2k-label text-center">// inventaire vide //</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
