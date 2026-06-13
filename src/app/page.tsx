'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
    <div className="page-shell page-enter items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="eyebrow">Multijoueur</span>
          <h1 className="page-title">Jeu de l&apos;oie</h1>
          <p className="body-text max-w-xs">
            Crée une partie pour devenir narrateur, ou rejoins une partie déjà ouverte.
          </p>
        </div>

        <div className="bento-card w-full text-left">
          {view === 'menu' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <button
                type="button"
                onClick={handleCreateGame}
                disabled={creating}
                className="btn-pill btn-pill-primary w-full"
              >
                {creating ? 'Création…' : 'Créer une partie'}
              </button>
              <p className="body-text text-center text-xs">
                Tu seras le narrateur, pas un joueur.
              </p>

              {createError && <p className="danger-text">{createError}</p>}

              <hr className="divider my-2" />

              <button
                type="button"
                onClick={() => setView('join')}
                className="btn-link"
              >
                Rejoindre une partie <span className="chevron">›</span>
              </button>
            </div>
          )}

          {view === 'join' && (
            <form onSubmit={handleJoinGame} className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img src={avatar} alt="Avatar" className="avatar-circle w-20 h-20" />
                  ) : (
                    <span className="avatar-placeholder w-20 h-20">Photo</span>
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
                <label className="field-label">Code de la partie</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ex: A1B2"
                  maxLength={4}
                  className="input-field text-center uppercase tracking-[0.3em]"
                />
              </div>

              <div>
                <label className="field-label">Pseudo</label>
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Ton nom"
                  className="input-field"
                />
              </div>

              {joinError && <p className="danger-text">{joinError}</p>}

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setView('menu')}
                  className="btn-link"
                >
                  <span className="chevron">‹</span> Retour
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="btn-pill btn-pill-primary"
                >
                  {joining ? '…' : 'Rejoindre'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
