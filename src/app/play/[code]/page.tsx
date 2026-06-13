'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGameStatus } from '@/hooks/useGameStatus';
import { useRealtimePlayer } from '@/hooks/useRealtimePlayer';
import { DESTINATIONS, locationName } from '@/lib/locations';
import TopBar from '@/components/TopBar';
import Reveal from '@/components/Reveal';
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
      setRequestMessage('error:Erreur lors de l\'envoi.');
    } else {
      setRequestText('');
      setRequestMessage('ok:Demande envoyée au narrateur.');
    }

    setSendingRequest(false);
  };

  if (loading) {
    return (
      <div className="page-shell page-enter items-center justify-center px-4 py-12">
        <p className="body-text">Chargement…</p>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="page-shell page-enter items-center justify-center px-4 py-12">
        <div className="bento-card w-full max-w-sm text-center">
          <p className="danger-text">{error ?? 'Joueur introuvable.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell page-enter">
      <TopBar
        title={code}
        items={[
          { label: 'Solde', value: `${player.money}` },
          { label: 'Vie', value: `${player.life}` },
          ...(status === 'playing' ? [{ label: 'Lieu', value: locationName(player.location) }] : []),
        ]}
      />

      <div className="flex flex-col items-center gap-6 px-4 py-8 sm:px-6 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center gap-3 text-center">
          {player.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
            <img src={player.image} alt={player.name} className="avatar-circle w-24 h-24 sm:w-28 sm:h-28" />
          ) : (
            <span className="avatar-placeholder w-24 h-24 sm:w-28 sm:h-28">—</span>
          )}
          <h1 className="page-title text-3xl sm:text-4xl">{player.name}</h1>
        </div>

        {player.narratorMessage && (
          <Reveal className="w-full">
            <div className="bento-card w-full flex flex-col gap-1.5" style={{ background: 'var(--accent-soft)' }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>Message du narrateur</span>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {player.narratorMessage}
              </p>
            </div>
          </Reveal>
        )}

        {status === 'lobby' ? (
          <p className="body-text text-center">
            En attente que le narrateur démarre la partie…
          </p>
        ) : (
          <>
            {/* Se déplacer */}
            <Reveal className="w-full">
              <div className="bento-card w-full flex flex-col gap-3">
                <h2 className="section-title">Se déplacer</h2>
                <div className="grid grid-cols-2 gap-2">
                  {DESTINATIONS.map((dest) => {
                    const isActive = player.location === dest.id;

                    return isActive ? (
                      <span key={dest.id} className="badge w-full justify-center">
                        {dest.name}
                      </span>
                    ) : (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => handleMove(dest.id)}
                        className="btn-pill btn-pill-secondary"
                      >
                        {dest.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* Inventaire */}
            <Reveal className="w-full" delay={80}>
              <div className="bento-card w-full flex flex-col gap-3">
                <h2 className="section-title">Inventaire</h2>

                {player.inventory.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {player.inventory.map((item) => (
                      <div key={item.id} className="bento-card-soft flex items-center gap-3">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-xl flex-shrink-0"
                          />
                        ) : (
                          <div className="avatar-placeholder w-10 h-10 rounded-xl flex-shrink-0">—</div>
                        )}
                        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {item.name}
                          </span>
                          {item.durability !== undefined && (
                            <span className="text-xs" style={{ color: 'var(--accent)' }}>
                              Durabilité {item.durability}
                            </span>
                          )}
                          {item.description && (
                            <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="body-text">Inventaire vide.</p>
                )}
              </div>
            </Reveal>

            {/* Demander au narrateur */}
            <Reveal className="w-full" delay={160}>
              <div className="bento-card w-full flex flex-col gap-3">
                <h2 className="section-title">Demander au narrateur</h2>

                <form onSubmit={handleSendRequest} className="flex flex-col gap-3">
                  <textarea
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="Ex: Je voudrais fouiller la poubelle..."
                    rows={3}
                    className="input-field resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingRequest || requestText.trim() === ''}
                    className="btn-pill btn-pill-primary w-full"
                  >
                    {sendingRequest ? 'Envoi…' : 'Envoyer la demande'}
                  </button>
                </form>

                {requestMessage && (
                  <p className={requestMessage.startsWith('error:') ? 'danger-text' : 'success-text'}>
                    {requestMessage.replace(/^(error|ok):/, '')}
                  </p>
                )}
              </div>
            </Reveal>
          </>
        )}
      </div>
    </div>
  );
}
