'use client';

import { useCallback } from 'react';

type ActionVideoProps = {
  style: React.CSSProperties;
  onEnded: () => void;
};

export default function ActionVideo({ style, onEnded }: ActionVideoProps) {
  const handleEnded = useCallback(() => {
    onEnded();
  }, [onEnded]);

  return (
    <div style={style} className="floating-panel">
      <video
        width={200}
        autoPlay
        className="rounded-3xl"
        style={{ boxShadow: 'var(--shadow-card-hover)', display: 'block' }}
        src="/videos/croque-monsieur.mp4"
        onEnded={handleEnded}
        playsInline
      />
    </div>
  );
}
