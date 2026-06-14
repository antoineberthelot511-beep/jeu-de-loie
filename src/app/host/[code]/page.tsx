'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGameStatus } from '@/hooks/useGameStatus';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useActionRequests } from '@/hooks/useActionRequests';
import NarratorMaps from '@/components/NarratorMaps';
import NarratorPlayerPanel from '@/components/NarratorPlayerPanel';
import NarratorPowers from '@/components/NarratorPowers';
import NarratorSettings from '@/components/NarratorSettings';
import TopBar from '@/components/TopBar';
import TabBar from '@/components/TabBar';
import type { Item } from '@/types/game';

const TABS = [
  { id: 'maps', label: 'Maps' },
  { id: 'players', label: 'Joueurs' },
  { id: 'narrator', label: 'Narrateur' },
  { id: 'settings', label: 'Réglages' },
];

export default function HostPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { gameId, status, setStatus, worldImages, loading, error } = useGameStatus(code);
  const players = useRealtimePlayers(gameId);
  const pendingRequests = useActionRequests(gameId);

  const [starting, setStarting] = useState(false);
  const [activeTab, setActiveTab] = useState('maps');

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
    void supabase.from('action_requests').update({ status: 'resolved' }).eq('id', requestId).then();
  };

  // Narrateur action: incrémente le compteur croque-monsieur du joueur ciblé,
  // ce qui déclenche la vidéo en plein écran sur son téléphone.
  const handleSummonCroqueMonsieur = (playerId: string) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    void supabase
      .from('players')
      .update({ croque_count: target.croqueCount + 1 })
      .eq('id', playerId)
      .then();
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
          .eq('id', p.id)
          .then();
      });
    } else {
      void supabase
        .from('players')
        .update({ inventory: [...target.inventory, { ...item, id: crypto.randomUUID() }] })
        .eq('id', playerId)
        .then();
    }

    return isCollective;
  };

  const handleRemoveItem = (playerId: string, itemId: string) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    void supabase
      .from('players')
      .update({ inventory: target.inventory.filter((item) => item.id !== itemId) })
      .eq('id', playerId)
      .then();
  };

  const handleAdjustMoney = (playerId: string, amount: number) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    void supabase
      .from('players')
      .update({ money: Math.max(0, target.money + amount) })
      .eq('id', playerId)
      .then();
  };

  const handleAdjustLife = (playerId: string, amount: number) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    void supabase
      .from('players')
      .update({ life: Math.max(0, target.life + amount) })
      .eq('id', playerId)
      .then();
  };

  const handleSendMessage = (playerId: string, message: string) => {
    void supabase
      .from('players')
      .update({ narrator_message: message || null })
      .eq('id', playerId)
      .then();
  };

  if (loading) {
    return (
      <div className="page-shell page-enter items-center justify-center px-4 py-12">
        <p className="body-text">Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell page-enter items-center justify-center px-4 py-12">
        <div className="bento-card w-full max-w-md text-center">
          <h1 className="section-title mb-2">Narrateur</h1>
          <p className="danger-text">{error}</p>
        </div>
      </div>
    );
  }

  if (status === 'lobby') {
    return (
      <div className="page-shell page-enter items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="eyebrow">Code de la partie</span>
            <h1 className="page-title tracking-[0.2em]">{code}</h1>
          </div>

          <div className="bento-card w-full flex flex-col gap-4">
            <h2 className="section-title text-center">
              Joueurs connectés ({players.length})
            </h2>

            {players.length === 0 ? (
              <p className="body-text text-center">En attente de joueurs…</p>
            ) : (
              <div className="flex flex-col gap-2">
                {players.map((player) => (
                  <div key={player.id} className="bento-card-soft flex items-center gap-3">
                    {player.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                      <img src={player.image} alt={player.name} className="avatar-circle w-10 h-10 flex-shrink-0" />
                    ) : (
                      <span className="avatar-placeholder w-10 h-10 flex-shrink-0">—</span>
                    )}
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleStartGame}
              disabled={starting}
              className="btn-pill btn-pill-primary w-full"
            >
              {starting ? '…' : 'Démarrer la partie'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // status === 'playing'
  return (
    <div className="page-shell page-enter">
      <TopBar
        title={`Partie ${code}`}
        items={[{ label: 'Joueurs', value: String(players.length) }]}
      >
        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </TopBar>

      {activeTab === 'maps' && <NarratorMaps players={players} />}

      {activeTab === 'players' && (
        <NarratorPlayerPanel
          players={players}
          onGiveItem={handleGiveItem}
          onRemoveItem={handleRemoveItem}
          onAdjustMoney={handleAdjustMoney}
          onAdjustLife={handleAdjustLife}
          onSendMessage={handleSendMessage}
        />
      )}

      {activeTab === 'narrator' && (
        <NarratorPowers
          players={players}
          requests={pendingRequests}
          onResolve={handleResolveRequest}
          onSummonCroqueMonsieur={handleSummonCroqueMonsieur}
        />
      )}

      {activeTab === 'settings' && <NarratorSettings gameId={gameId} worldImages={worldImages} />}
    </div>
  );
}
