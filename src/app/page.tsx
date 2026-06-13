'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TitleBar from '@/components/TitleBar';

type View = 'menu' | 'join';

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export default function Page() {
  const router = useRouter();
  const [view, setView] = useState<View>('menu');

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [joinCode, setJoinCode] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateGame = async () => {
    setCreating(true);
    setCreateError(null);

    try {
      let game: { id: string; code: string } | null = null;

      for (let attempt = 0; attempt < 5 && !game; attempt++) {
        const code = generateCode();
        const { data, error } = await supabase
          .from('games')
          .insert({ code })
          .select('id, code')
          .single();

        if (!error && data) {
          game = data;
        } else if (error && error.code !== '23505') {
          // 23505 = violation de contrainte unique -> on retente avec un autre code
          throw error;
        }
      }

      if (!game) throw new Error('Impossible de générer un code unique.');

      localStorage.setItem('gameId', game.id);
      localStorage.setItem('isNarrator', 'true');
      router.push(`/host/${game.code}`);
    } catch (err) {
      console.error(err);
      setCreateError('Impossible de créer la partie. Réessaie.');
      setCreating(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPseudo = pseudo.trim();
    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode || !trimmedPseudo) return;

    setJoining(true);
    setJoinError(null);

    try {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id, code')
        .eq('code', trimmedCode)
        .maybeSingle();

      if (gameError) throw gameError;

      if (!game) {
        setJoinError('Partie introuvable');
        setJoining(false);
        return;
      }

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: game.id,
          name: trimmedPseudo,
          avatar,
          money: 100,
          location: 'hub',
        })
        .select('id')
        .single();

      if (playerError) throw playerError;

      localStorage.setItem('gameId', game.id);
      localStorage.setItem('playerId', player.id);
      router.push(`/play/${game.code}`);
    } catch (err) {
      console.error(err);
      setJoinError('Impossible de rejoindre la partie. Réessaie.');
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="y2k-window w-full max-w-md">
        <TitleBar title="Jeu de l'oie - Nerdland" />

        <div className="y2k-window-content space-y-6">
          <h1 className="chrome-text text-2xl sm:text-3xl text-center">
            <span className="sparkle">BIENVENUE</span>
          </h1>

          {view === 'menu' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCreateGame}
                  disabled={creating}
                  className="y2k-btn y2k-btn-magenta w-full"
                >
                  {creating ? '⏳ Création...' : '🎙️ Créer une partie'}
                </button>
                <p className="y2k-label text-center text-xs">
                  // tu seras le Narrateur, pas un joueur //
                </p>
                {createError && (
                  <p
                    className="text-center text-sm"
                    style={{
                      fontFamily: 'var(--font-display), sans-serif',
                      color: 'var(--magenta)',
                    }}
                  >
                    ⚠ {createError} ⚠
                  </p>
                )}
              </div>

              <hr className="chrome-divider" />

              <button
                type="button"
                onClick={() => setView('join')}
                className="y2k-btn y2k-btn-green w-full"
              >
                🎮 Rejoindre une partie
              </button>
            </div>
          )}

          {view === 'join' && (
            <form onSubmit={handleJoinGame} className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="avatar-upload" className="avatar-chrome cursor-pointer">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img src={avatar} alt="Avatar" className="w-16 h-16" />
                  ) : (
                    <span
                      className="glass-placeholder w-16 h-16 flex items-center justify-center text-xs text-center rounded-full"
                      style={{ fontFamily: 'var(--font-terminal), monospace' }}
                    >
                      PHOTO
                    </span>
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                />
              </div>

              <div>
                <label className="y2k-label block mb-1">Code de la partie</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ex: A1B2"
                  maxLength={4}
                  className="y2k-input w-full text-center uppercase"
                />
              </div>

              <div>
                <label className="y2k-label block mb-1">Pseudo</label>
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Ton nom"
                  className="y2k-input w-full"
                />
              </div>

              {joinError && (
                <p
                  className="text-center text-sm"
                  style={{
                    fontFamily: 'var(--font-display), sans-serif',
                    color: 'var(--magenta)',
                  }}
                >
                  ⚠ {joinError} ⚠
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('menu')}
                  className="y2k-btn y2k-btn-chrome flex-1"
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="y2k-btn y2k-btn-green flex-1"
                >
                  {joining ? '⏳ ...' : '▶ Rejoindre'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
