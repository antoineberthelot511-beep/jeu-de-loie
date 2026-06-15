'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGameStatus } from '@/hooks/useGameStatus';
import { useRealtimePlayer } from '@/hooks/useRealtimePlayer';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { locationName } from '@/lib/locations';
import { board } from '@/data/board';
import TopBar from '@/components/TopBar';
import Reveal from '@/components/Reveal';
import GameBoard from '@/components/GameBoard';
import PlayerCombat from '@/components/PlayerCombat';

export default function PlayPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { gameId, status, combat, loading: statusLoading, error: statusError } = useGameStatus(code);

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
  const players = useRealtimePlayers(gameId);

  const handleAttack = () => {
    if (!playerId) return;
    void supabase.from('players').update({ combat_action: 'attack' }).eq('id', playerId).then();
  };

  const handleMove = (delta: number) => {
    if (!playerId || !player) return;
    const newIndex = Math.min(Math.max(player.nodeIndex + delta, 0), board.length - 1);
    if (newIndex === player.nodeIndex) return;
    void supabase.from('players').update({ node_index: newIndex }).eq('id', playerId).then();
  };

  const [requestText, setRequestText] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(undefined);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const handleOpenSettings = () => {
    if (player) {
      setEditName(player.name);
      setEditAvatar(player.image || undefined);
    }
    setProfileMessage(null);
    setShowSettings(true);
  };

  const loading = statusLoading || playerLoading;
  const error = localError ?? statusError;

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') setEditAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = editName.trim();
    if (!trimmed || !playerId) return;

    setSavingProfile(true);
    setProfileMessage(null);

    const { error: updateError } = await supabase
      .from('players')
      .update({ name: trimmed, avatar: editAvatar ?? null })
      .eq('id', playerId);

    if (updateError) {
      setProfileMessage('error:Erreur lors de la mise à jour du profil.');
    } else {
      setProfileMessage('ok:Profil mis à jour.');
    }

    setSavingProfile(false);
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

  // Vidéo plein écran du croque-monsieur, déclenchée par le narrateur
  const croqueVideoRef = useRef<HTMLVideoElement | null>(null);
  const prevCroqueCountRef = useRef<number | null>(null);
  const audioUnlockedRef = useRef(false);
  const [showCroqueVideo, setShowCroqueVideo] = useState(false);

  // Détecte une augmentation de croque_count (déclenchement à distance par le narrateur)
  useEffect(() => {
    const current = player?.croqueCount;
    if (current === undefined) return;

    const previous = prevCroqueCountRef.current;
    prevCroqueCountRef.current = current;

    if (previous !== null && current > previous) {
      setShowCroqueVideo(true);
    }
  }, [player?.croqueCount]);

  // Joue la vidéo avec le son dès qu'elle doit s'afficher
  useEffect(() => {
    if (!showCroqueVideo) return;
    const video = croqueVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    void video.play();
  }, [showCroqueVideo]);

  // Débloque la lecture avec son sur mobile dès la première interaction du joueur
  useEffect(() => {
    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      const video = croqueVideoRef.current;
      if (!video) return;

      audioUnlockedRef.current = true;
      video.muted = true;
      video
        .play()
        .then(() => {
          video.pause();
          video.currentTime = 0;
          video.muted = false;
        })
        .catch(() => {
          video.muted = false;
        });
    };

    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const croqueVideoOverlay = (
    <video
      ref={croqueVideoRef}
      src="/videos/croque-monsieur.mp4"
      preload="auto"
      playsInline
      onEnded={() => setShowCroqueVideo(false)}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: showCroqueVideo ? 100000 : -1,
        opacity: showCroqueVideo ? 1 : 0,
        pointerEvents: showCroqueVideo ? 'auto' : 'none',
      }}
    />
  );

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

  // Combat actif : tous les écrans basculent sur l'écran de combat.
  if (combat.active) {
    return <PlayerCombat combat={combat} player={player} players={players} onAttack={handleAttack} />;
  }

  const requestForm = (
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
      {requestMessage && (
        <p className={requestMessage.startsWith('error:') ? 'danger-text' : 'success-text'}>
          {requestMessage.replace(/^(error|ok):/, '')}
        </p>
      )}
    </form>
  );

  if (status !== 'playing') {
    return (
      <div className="page-shell page-enter">
        <TopBar
          title={code}
          items={[
            { label: 'Solde', value: `${player.money}` },
            { label: 'Vie', value: `${player.life}` },
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
              <div className="speech-bubble w-full flex flex-col gap-1.5">
                <span className="eyebrow">📣 Message du narrateur</span>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {player.narratorMessage}
                </p>
              </div>
            </Reveal>
          )}

          <p className="body-text text-center">
            En attente que le narrateur démarre la partie…
          </p>
        </div>

        {croqueVideoOverlay}
      </div>
    );
  }

  // status === 'playing'
  const currentNode = board.find((n) => n.id === player.nodeIndex) ?? board[0];

  return (
    <div className="page-shell page-enter">
      {/* En-tête fine */}
      <div className="glass-bar">
        <div className="glass-bar-inner">
          <button
            type="button"
            onClick={handleOpenSettings}
            className="fab"
            style={{ width: '2.75rem', height: '2.75rem', fontSize: '1.15rem', flexShrink: 0 }}
            aria-label="Réglages"
          >
            ⚙
          </button>
          <span className="section-title truncate" style={{ flex: 1, textAlign: 'center' }}>
            {locationName(player.location)}
          </span>
          <div className="flex items-center gap-2 min-w-0" style={{ flexShrink: 0, maxWidth: '40%' }}>
            {player.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
              <img src={player.image} alt={player.name} className="avatar-circle w-9 h-9 flex-shrink-0" />
            ) : (
              <span className="avatar-placeholder w-9 h-9 flex-shrink-0">—</span>
            )}
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {player.name}
            </span>
          </div>
        </div>
      </div>

      {/* Plateau */}
      <div className="flex-1 px-4 py-3 sm:px-6 max-w-2xl mx-auto w-full flex">
        <GameBoard players={[player]} />
      </div>

      {/* Case actuelle + déplacement */}
      <div className="px-4 pb-3 sm:px-6 max-w-2xl mx-auto w-full">
        <Reveal>
          <div className="bento-card-soft w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="eyebrow">📍 {currentNode.label}</span>
              {currentNode.event && <p className="body-text">{currentNode.event}</p>}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleMove(-1)}
                disabled={player.nodeIndex <= 0}
                className="btn-pill btn-pill-secondary flex-1"
              >
                ◀ Reculer
              </button>
              <button
                type="button"
                onClick={() => handleMove(1)}
                disabled={player.nodeIndex >= board.length - 1}
                className="btn-pill btn-pill-primary flex-1"
              >
                Avancer ▶
              </button>
            </div>

            {currentNode.type === 'epicerie' && (
              <button
                type="button"
                onClick={() => setShowShop(true)}
                className="btn-pill btn-pill-soft w-full"
              >
                🛒 Entrer dans l&apos;épicerie
              </button>
            )}
          </div>
        </Reveal>
      </div>

      {/* Barre de stats */}
      <div className="px-4 pb-4 sm:px-6 max-w-2xl mx-auto w-full flex flex-col gap-2">
        {player.narratorMessage && (
          <Reveal>
            <div className="speech-bubble w-full flex flex-col gap-1">
              <span className="eyebrow">📣 Message du narrateur</span>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {player.narratorMessage}
              </p>
            </div>
          </Reveal>
        )}

        <div className="bento-card-soft w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="badge">{player.money} roupies</span>
            <span className="badge badge-neutral">{player.life} vie</span>
          </div>
          <button
            type="button"
            onClick={() => setShowInventory(true)}
            className="btn-pill btn-pill-soft btn-pill-sm"
          >
            Inventaire{player.inventory.length > 0 ? ` (${player.inventory.length})` : ''}
          </button>
        </div>
      </div>

      {/* Panneau inventaire */}
      {showInventory && (
        <div className="modal-overlay" onClick={() => setShowInventory(false)}>
          <div
            className="floating-panel bento-card w-full max-w-md max-h-[75vh] overflow-y-auto flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
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

            <button type="button" onClick={() => setShowInventory(false)} className="btn-pill btn-pill-secondary w-full">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Panneau réglages */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div
            className="floating-panel bento-card w-full max-w-md max-h-[85vh] overflow-y-auto flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="section-title">Profil</h2>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="profile-avatar-upload" className="cursor-pointer">
                  {editAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img src={editAvatar} alt="Avatar" className="avatar-circle w-20 h-20" />
                  ) : (
                    <span className="avatar-placeholder w-20 h-20">Photo</span>
                  )}
                </label>
                <input
                  id="profile-avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                />
              </div>

              <div>
                <label className="field-label">Pseudo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ton pseudo"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile || editName.trim() === ''}
                className="btn-pill btn-pill-primary w-full"
              >
                {savingProfile ? 'Enregistrement…' : 'Enregistrer le profil'}
              </button>

              {profileMessage && (
                <p className={profileMessage.startsWith('error:') ? 'danger-text' : 'success-text'}>
                  {profileMessage.replace(/^(error|ok):/, '')}
                </p>
              )}
            </form>

            <hr className="divider" />

            <h2 className="section-title">Demander au narrateur</h2>
            {requestForm}

            <button type="button" onClick={() => setShowSettings(false)} className="btn-pill btn-pill-secondary w-full">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Panneau épicerie */}
      {showShop && (
        <div className="modal-overlay" onClick={() => setShowShop(false)}>
          <div
            className="floating-panel bento-card w-full max-w-md flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="section-title">🛒 Épicerie du village</h2>
            <p className="body-text">
              Le marchand prépare son étal... reviens un peu plus tard pour faire tes emplettes !
            </p>
            <button type="button" onClick={() => setShowShop(false)} className="btn-pill btn-pill-secondary w-full">
              Fermer
            </button>
          </div>
        </div>
      )}

      {croqueVideoOverlay}
    </div>
  );
}
