'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Item } from '@/types/game';
import { useGameStatus } from '@/hooks/useGameStatus';
import { useRealtimePlayer } from '@/hooks/useRealtimePlayer';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { locationName } from '@/lib/locations';
import { board } from '@/data/board';
import TopBar from '@/components/TopBar';
import Reveal from '@/components/Reveal';
import GameBoard from '@/components/GameBoard';
import PlayerCombat from '@/components/PlayerCombat';
import ChaosWheel from '@/components/ChaosWheel';

export default function PlayPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();
  const router = useRouter();

  const { gameId, status, combat, shopItems, round, loading: statusLoading, error: statusError } = useGameStatus(code);

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

  // Roue du Chaos : enregistre le résultat du lancer pour ce tour.
  const handleRoll = (value: number) => {
    if (!playerId) return;
    void supabase.from('players').update({ roll: value }).eq('id', playerId).then();
  };

  // Roue du Chaos : le roll ne sert qu'à déterminer l'ordre de jeu.
  // À son tour, le joueur avance toujours d'une seule case, puis marque son tour comme joué.
  const handleAdvance = () => {
    if (!playerId || !player || player.roll === null) return;
    const newIndex = Math.min(player.nodeIndex + 1, board.length - 1);
    void supabase
      .from('players')
      .update({ node_index: newIndex, has_moved: true })
      .eq('id', playerId)
      .then();
  };

  const [requestText, setRequestText] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [shopMessage, setShopMessage] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemImage, setNewItemImage] = useState<string | undefined>(undefined);
  const [addItemMessage, setAddItemMessage] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(undefined);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leavingGame, setLeavingGame] = useState(false);

  const handleOpenSettings = () => {
    if (player) {
      setEditName(player.name);
      setEditAvatar(player.image || undefined);
    }
    setProfileMessage(null);
    setConfirmLeave(false);
    setShowSettings(true);
  };

  const handleLeaveGame = async () => {
    if (!playerId || leavingGame) return;
    setLeavingGame(true);
    await supabase.from('players').delete().eq('id', playerId);
    localStorage.removeItem('gameId');
    localStorage.removeItem('playerId');
    router.push('/');
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

  const handleBuyItem = async (item: Item) => {
    if (!playerId || !player || !gameId) return;

    if (item.quantity === 0) {
      setShopMessage('error:Article épuisé.');
      setTimeout(() => setShopMessage(null), 3000);
      return;
    }

    if (player.money < item.price) {
      setShopMessage('error:Pas assez de roupies.');
      setTimeout(() => setShopMessage(null), 3000);
      return;
    }

    const newMoney = player.money - item.price;
    const newItem = { ...item, id: crypto.randomUUID() };
    const newInventory = [...player.inventory, newItem];
    const { error } = await supabase
      .from('players')
      .update({ money: newMoney, inventory: newInventory })
      .eq('id', playerId);

    if (error) {
      setShopMessage('error:Erreur lors de l\'achat.');
      setTimeout(() => setShopMessage(null), 3000);
      return;
    }

    if (item.quantity !== undefined) {
      const newShopItems = shopItems.map((shopItem) =>
        shopItem.id === item.id ? { ...shopItem, quantity: Math.max(0, shopItem.quantity! - 1) } : shopItem
      );
      void supabase.from('games').update({ shop_items: newShopItems }).eq('id', gameId).then();
    }

    const audio = new Audio('/sons/apple-pay.mp3');
    void audio.play().catch(() => {});

    setShopMessage(`ok:Achat réussi : ${item.name}`);
    setTimeout(() => setShopMessage(null), 3000);
  };

  const handleNewItemImageChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') setNewItemImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddShopItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;

    const trimmedName = newItemName.trim();
    const parsedPrice = Number(newItemPrice);
    const parsedQuantity = Number(newItemQuantity);

    if (!trimmedName || !Number.isFinite(parsedPrice) || parsedPrice < 0) return;
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) return;

    const newShopItem: Item = {
      id: crypto.randomUUID(),
      name: trimmedName,
      price: parsedPrice,
      quantity: parsedQuantity,
      image: newItemImage,
    };

    const { error } = await supabase
      .from('games')
      .update({ shop_items: [...shopItems, newShopItem] })
      .eq('id', gameId);

    if (error) {
      setAddItemMessage('error:Erreur lors de l\'ajout.');
    } else {
      setAddItemMessage(`ok:${trimmedName} mis en vente.`);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemQuantity('');
      setNewItemImage(undefined);
    }
  };

  // Vidéo plein écran du croque-monsieur, déclenchée par le narrateur
  const croqueVideoRef = useRef<HTMLVideoElement | null>(null);
  const prevCroqueCountRef = useRef<number | null>(null);
  const audioUnlockedRef = useRef(false);
  const [showCroqueVideo, setShowCroqueVideo] = useState(false);

  // Roue du Chaos : son "ahh" sur le téléphone des joueurs qui n'ont pas le meilleur roll du tour.
  const ahhAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastAhhRoundRef = useRef<number | null>(null);

  // Détecte une augmentation de croque_count (déclenchement à distance par le narrateur).
  // Dépend de [player] (et non de player?.croqueCount) pour réagir à chaque update Supabase
  // même si croqueCount n'est pas la seule valeur qui change dans le payload.
  useEffect(() => {
    if (!player) return;
    const current = player.croqueCount;
    const previous = prevCroqueCountRef.current;

    console.log('[croque] player update — croque_count:', current, '| previous ref:', previous);

    prevCroqueCountRef.current = current;

    if (previous !== null && current > previous) {
      console.log('[croque] → TRIGGER vidéo (', previous, '→', current, ')');
      setShowCroqueVideo(true);
    }
  }, [player]);

  // Roue du Chaos : dès que tout le monde a tourné la roue, les joueurs qui n'ont
  // pas le meilleur roll entendent un petit "ahh" de déception (déclenché à distance).
  useEffect(() => {
    if (!player || player.roll === null) return;

    const rolledCount = players.filter((p) => p.roll !== null).length;
    const allRolled = players.length > 0 && rolledCount === players.length;
    if (!allRolled) return;

    if (lastAhhRoundRef.current === round) return;
    lastAhhRoundRef.current = round;

    const maxRoll = Math.max(...players.map((p) => p.roll ?? 0));
    if (player.roll < maxRoll) {
      const audio = ahhAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.muted = false;
        void audio.play().catch(() => {});
      }
    }
  }, [players, player, round]);

  // Joue la vidéo avec le son dès qu'elle doit s'afficher
  useEffect(() => {
    if (!showCroqueVideo) return;
    const video = croqueVideoRef.current;
    if (!video) return;

    console.log('[croque] tentative play vidéo, muted:', video.muted);
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    video.play().catch((e) => console.error('[croque] play() échoué:', e));
  }, [showCroqueVideo]);

  // Débloque la lecture avec son sur mobile dès la première interaction du joueur.
  // On marque audioUnlockedRef seulement quand la vidéo ET l'audio sont tous deux prêts,
  // pour éviter de verrouiller le flag avant que les éléments soient montés.
  useEffect(() => {
    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;

      const video = croqueVideoRef.current;
      const ahh = ahhAudioRef.current;

      // Attend que les éléments soient dans le DOM (possible si le joueur tape très tôt)
      if (!video || !ahh) return;

      audioUnlockedRef.current = true;
      console.log('[audio] déverrouillage audio au premier tap');

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

      ahh.muted = true;
      ahh
        .play()
        .then(() => {
          ahh.pause();
          ahh.currentTime = 0;
          ahh.muted = false;
        })
        .catch(() => {
          ahh.muted = false;
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
    <>
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
      <audio ref={ahhAudioRef} src="/sons/ahh.mp3" preload="auto" />
    </>
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

  // Roue du Chaos : classement du tour (roll décroissant, égalité = ordre d'arrivée).
  const rolledCount = players.filter((p) => p.roll !== null).length;
  const allRolled = players.length > 0 && rolledCount === players.length;
  const turnOrder = allRolled ? [...players].sort((a, b) => (b.roll ?? 0) - (a.roll ?? 0)) : [];
  const currentTurnPlayer = turnOrder.find((p) => !p.hasMoved);
  const isMyTurn = currentTurnPlayer?.id === player.id;

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
        <GameBoard players={players} currentPlayerId={player.id} />
      </div>

      {/* Case actuelle + déplacement */}
      <div className="px-4 pb-3 sm:px-6 max-w-2xl mx-auto w-full">
        <Reveal>
          <div className="bento-card-soft w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="eyebrow">📍 {currentNode.label}</span>
              {currentNode.event && <p className="body-text">{currentNode.event}</p>}
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

      {/* Roue du Chaos : système de tour */}
      <div className="px-4 pb-3 sm:px-6 max-w-2xl mx-auto w-full">
        <Reveal delay={40}>
          <div className="bento-card w-full flex flex-col items-center gap-3 text-center">
            <div className="flex items-center justify-between w-full">
              <span className="eyebrow">🎡 Roue du Chaos</span>
              <span className="badge badge-neutral">Tour {round}</span>
            </div>

            {player.roll === null ? (
              <>
                <p className="body-text">Tourne la roue pour déterminer l&apos;ordre de jeu : le plus haut score joue en premier !</p>
                <ChaosWheel value={null} onResult={handleRoll} />
              </>
            ) : (
              <>
                <ChaosWheel value={player.roll} disabled onResult={() => {}} />

                {!allRolled ? (
                  <p className="body-text">
                    Tu as fait <strong>{player.roll}</strong> ! En attente des autres joueurs ({rolledCount}/{players.length})…
                  </p>
                ) : player.hasMoved ? (
                  <p className="body-text">Tu as avancé d&apos;une case. En attente de la fin du tour…</p>
                ) : isMyTurn ? (
                  <>
                    <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                      C&apos;est ton tour ! Avance d&apos;une case.
                    </p>
                    <button type="button" onClick={handleAdvance} className="btn-pill btn-pill-primary w-full">
                      Avancer ▶
                    </button>
                  </>
                ) : (
                  <p className="body-text">
                    C&apos;est le tour de <strong>{currentTurnPlayer?.name}</strong>…
                  </p>
                )}
              </>
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

            <hr className="divider" />

            {!confirmLeave ? (
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                className="btn-pill btn-pill-danger w-full"
              >
                🚪 Quitter la partie
              </button>
            ) : (
              <div
                className="flex flex-col gap-3 rounded-2xl p-4"
                style={{
                  background: 'var(--danger-soft)',
                  border: '3px solid var(--danger)',
                  boxShadow: '4px 4px 0 var(--danger)',
                }}
              >
                <p
                  className="text-center font-bold text-base"
                  style={{ color: 'var(--danger)', fontFamily: 'var(--font-display)' }}
                >
                  Quitter la partie ?
                </p>
                <p className="body-text text-center text-sm">
                  Tu seras supprimé de la partie. Cette action est irréversible.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmLeave(false)}
                    disabled={leavingGame}
                    className="btn-pill btn-pill-secondary flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveGame}
                    disabled={leavingGame}
                    className="btn-pill btn-pill-danger flex-1"
                  >
                    {leavingGame ? 'Départ…' : 'Oui, quitter'}
                  </button>
                </div>
              </div>
            )}

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
            <Image
              src="/photojeu/epicerie-interieur.jpg"
              alt="Intérieur de l'épicerie"
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <h2 className="section-title">🛒 Épicerie du village</h2>
            {shopMessage && (
              <p className={shopMessage.startsWith('error:') ? 'danger-text' : 'success-text'}>
                {shopMessage}
              </p>
            )}
            <div className="flex flex-col gap-2">
              {shopItems.map((item) => (
                <div key={item.id} className="bento-card-soft flex flex-col gap-2">
                  <div className="flex items-center gap-3">
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
                      <span className="text-xs" style={{ color: 'var(--accent)' }}>
                        {item.price} roupies
                      </span>
                      {item.quantity !== undefined && (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Stock : {item.quantity}
                        </span>
                      )}
                      {item.description && (
                        <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBuyItem(item)}
                    disabled={item.quantity === 0 || player.money < item.price}
                    className="btn-pill btn-pill-primary w-full"
                  >
                    {item.quantity === 0 ? 'Épuisé' : 'Acheter'}
                  </button>
                </div>
              ))}
            </div>

            <hr className="divider" />

            <h2 className="section-title">Vendre un article</h2>
            <form onSubmit={handleAddShopItem} className="flex flex-col gap-2">
              <div>
                <label className="field-label">Nom</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex: Vieux chapeau"
                  className="input-field"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="field-label">Prix</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <label className="field-label">Quantité</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="1"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Photo (optionnel)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleNewItemImageChange(e.target.files?.[0])}
                  className="file-field"
                />
              </div>

              <button type="submit" className="btn-pill btn-pill-soft w-full">
                Mettre en vente
              </button>

              {addItemMessage && (
                <p className={addItemMessage.startsWith('error:') ? 'danger-text' : 'success-text'}>
                  {addItemMessage.replace(/^(error|ok):/, '')}
                </p>
              )}
            </form>

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