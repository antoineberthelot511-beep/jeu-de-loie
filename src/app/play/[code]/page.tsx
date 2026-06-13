'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type PlayerData = {
  id: string;
  name: string;
  avatar: string | null;
  money: number;
};

export default function PlayPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load this device's player from localStorage + Supabase
  useEffect(() => {
    const gameId = localStorage.getItem('gameId');
    const playerId = localStorage.getItem('playerId');

    if (!gameId || !playerId) {
      setError("Aucune partie en cours sur cet appareil.");
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      const { data, error: playerError } = await supabase
        .from('players')
        .select('id, name, avatar, money')
        .eq('id', playerId)
        .eq('game_id', gameId)
        .maybeSingle();

      if (!active) return;

      if (playerError || !data) {
        setError('Joueur introuvable.');
        setLoading(false);
        return;
      }

      setPlayer(data);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

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
          ) : player ? (
            <>
              <div className="flex flex-col items-center gap-3">
                <div className="avatar-chrome">
                  {player.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img
                      src={player.avatar}
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

              <p className="y2k-label text-center text-sm leading-relaxed">
                <span className="sparkle">
                  En attente que le narrateur démarre la partie...
                </span>
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
