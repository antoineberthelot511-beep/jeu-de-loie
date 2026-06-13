'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGameStatus } from '@/hooks/useGameStatus';
import { useRealtimePlayer } from '@/hooks/useRealtimePlayer';
import { DESTINATIONS, locationName } from '@/lib/locations';
import type { Player } from '@/types/game';

export default function PlayPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { gameId, status, loading: statusLoading, error: statusError } = useGameStatus(code);

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

  const [requestText, setRequestText] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  const loading = statusLoading || playerLoading;
  const error = localError ?? statusError;

  const handleMove = (destination: Player['location']) => {
    if (!playerId || !player || player.location === destination) return;
    void supabase.from('players').update({ location: destination }).eq('id', playerId);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = requestText.trim();
    if (!trimmed || !gameId || !playerId) return;

    setSendingRequest(true);
    setRequestMessage(null);

    const { error: insertError } = await supabase.from('action_requests').insert({
      game_id: gameId,
      player_id: playerId,
      content: trimmed,
      status: 'pending',
    });

    if (insertError) {
      setRequestMessage("⚠ Erreur lors de l'envoi ⚠");
    } else {
      setRequestText('');
      setRequestMessage('✦ Demande envoyée au narrateur ✦');
    }

    setSendingRequest(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3">
      <div className="y2k-window w-full max-w-sm">
        <div className="y2k-window-title">
          <span>◆ JOUEUR ◆</span>
          <span>★ {code} ★</span>
        </div>

        <div className="y2k-window-content space-y-6">
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
              {/* En-tête */}
              <div className="flex flex-col items-center gap-3 text-center">
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

                {status === 'playing' && (
                  <p className="y2k-label">
                    📍 {locationName(player.location)}
                  </p>
                )}
              </div>

              <hr className="chrome-divider" />

              {status === 'lobby' ? (
                <p className="y2k-label text-center text-sm leading-relaxed">
                  <span className="sparkle">
                    En attente que le narrateur démarre la partie...
                  </span>
                </p>
              ) : (
                <>
                  {/* Se déplacer */}
                  <div className="space-y-2">
                    <h2 className="chrome-text text-lg text-center mb-2">
                      <span className="sparkle">Se déplacer</span>
                    </h2>

                    <div className="grid grid-cols-2 gap-2">
                      {DESTINATIONS.map((dest) => {
                        const isActive = player.location === dest.id;

                        return (
                          <button
                            key={dest.id}
                            type="button"
                            disabled={isActive}
                            onClick={() => handleMove(dest.id)}
                            className="y2k-btn"
                            style={
                              {
                                '--btn-color': dest.color,
                                padding: '0.9rem 0.5rem',
                                fontSize: '0.85rem',
                                ...(isActive
                                  ? {
                                      filter: 'grayscale(0.4) brightness(0.7)',
                                      cursor: 'default',
                                      boxShadow:
                                        'inset 0 3px 8px rgba(0,0,0,0.6), 0 0 10px ' + dest.color,
                                    }
                                  : {}),
                              } as React.CSSProperties
                            }
                          >
                            {isActive ? `▶ ${dest.name} ◀` : dest.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="chrome-divider" />

                  {/* Inventaire */}
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

                  <hr className="chrome-divider" />

                  {/* Demander au narrateur */}
                  <div className="space-y-2">
                    <h2 className="chrome-text text-lg text-center mb-2">
                      <span className="sparkle">Demander au narrateur</span>
                    </h2>

                    <form onSubmit={handleSendRequest} className="space-y-2">
                      <textarea
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                        placeholder="Ex: Je voudrais fouiller la poubelle..."
                        rows={3}
                        className="y2k-input w-full resize-none"
                      />
                      <button
                        type="submit"
                        disabled={sendingRequest || requestText.trim() === ''}
                        className="y2k-btn y2k-btn-magenta w-full"
                        style={{ padding: '0.9rem 0.5rem' }}
                      >
                        {sendingRequest ? '⏳ Envoi...' : '✦ Envoyer la demande ✦'}
                      </button>
                    </form>

                    {requestMessage && (
                      <p
                        className="text-center text-sm"
                        style={{
                          fontFamily: 'var(--font-display), sans-serif',
                          color: requestMessage.startsWith('⚠')
                            ? 'var(--magenta)'
                            : 'var(--acid-green)',
                          textShadow: requestMessage.startsWith('⚠')
                            ? '0 0 8px var(--magenta)'
                            : '0 0 8px var(--acid-green)',
                        }}
                      >
                        {requestMessage}
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
