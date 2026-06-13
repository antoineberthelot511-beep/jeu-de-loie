'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGameStatus } from '@/hooks/useGameStatus';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useActionRequests } from '@/hooks/useActionRequests';
import NarrateurPanel from '@/components/NarrateurPanel';
import PlayersOverview from '@/components/PlayersOverview';
import ActionRequests from '@/components/ActionRequests';
import ActionVideo from '@/components/ActionVideo';
import type { Item } from '@/types/game';

export default function HostPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { gameId, status, setStatus, loading, error } = useGameStatus(code);
  const players = useRealtimePlayers(gameId);
  const pendingRequests = useActionRequests(gameId);

  const [starting, setStarting] = useState(false);
  const [videoOverlays, setVideoOverlays] = useState<
    { id: string; style: React.CSSProperties }[]
  >([]);

  const handleStartGame = async () => {
    if (!gameId) return;
    setStarting(true);
    const { error: updateError } = await supabase
      .from('games')
      .update({ status: 'playing' })
      .eq('id', gameId);

    if (!updateError) setStatus('playing');
    setStarting(false);
  };

  const handleResolveRequest = (requestId: string) => {
    void supabase.from('action_requests').update({ status: 'resolved' }).eq('id', requestId);
  };

  const spawnVideo = () => {
    const id = Math.random().toString(36).substring(2, 9);
    const top = Math.floor(Math.random() * 81) + 5; // 5%-85%
    const left = Math.floor(Math.random() * 81) + 5; // 5%-85%
    const style: React.CSSProperties = {
      position: 'fixed',
      top: `${top}%`,
      left: `${left}%`,
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      pointerEvents: 'none',
    };
    setVideoOverlays((prev) => [...prev, { id, style }]);
  };

  // Narrateur action: give an item to a player (collective if they're in Communisme Land)
  const handleGiveItem = (playerId: string, item: Item) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return false;

    const isCollective = target.location === 'world1';

    if (isCollective) {
      players.forEach((p) => {
        void supabase
          .from('players')
          .update({ inventory: [...p.inventory, { ...item, id: crypto.randomUUID() }] })
          .eq('id', p.id);
      });
    } else {
      void supabase
        .from('players')
        .update({ inventory: [...target.inventory, { ...item, id: crypto.randomUUID() }] })
        .eq('id', playerId);
    }

    return isCollective;
  };

  const handleRemoveItem = (playerId: string, itemId: string) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    void supabase
      .from('players')
      .update({ inventory: target.inventory.filter((item) => item.id !== itemId) })
      .eq('id', playerId);
  };

  const handleAdjustMoney = (playerId: string, amount: number) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    void supabase
      .from('players')
      .update({ money: Math.max(0, target.money + amount) })
      .eq('id', playerId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <p className="y2k-label text-center">// chargement... //</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="y2k-window w-full max-w-md">
          <div className="y2k-window-title">
            <span>◆ NARRATEUR ◆</span>
            <span>★ ERREUR ★</span>
          </div>
          <div className="y2k-window-content">
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
          </div>
        </div>
      </div>
    );
  }

  if (status === 'lobby') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="y2k-window w-full max-w-md">
          <div className="y2k-window-title">
            <span>◆ NARRATEUR ◆</span>
            <span>★ SALLE D&apos;ATTENTE ★</span>
          </div>

          <div className="y2k-window-content space-y-6">
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

              {players.length === 0 ? (
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
                        {player.image ? (
                          // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                          <img src={player.image} alt={player.name} className="w-10 h-10" />
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
              disabled={starting}
              className="y2k-btn y2k-btn-green w-full"
            >
              {starting ? '⏳ ...' : '▶ Démarrer la partie'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // status === 'playing'
  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 sm:p-6">
      <NarrateurPanel
        players={players}
        onGiveItem={handleGiveItem}
        onRemoveItem={handleRemoveItem}
        onAdjustMoney={handleAdjustMoney}
        onSummonCroqueMonsieur={spawnVideo}
      />

      <header className="neon-banner">
        <span className="sparkle">◆ PARTIE {code} EN COURS ◆</span>
      </header>

      <PlayersOverview players={players} />

      <ActionRequests
        requests={pendingRequests}
        players={players}
        onResolve={handleResolveRequest}
      />

      {videoOverlays.map(({ id, style }) => (
        <ActionVideo
          key={id}
          style={style}
          onEnded={() => {
            setVideoOverlays((prev) => prev.filter((v) => v.id !== id));
          }}
        />
      ))}
    </div>
  );
}
