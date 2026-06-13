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
    <video
      width={200}
      autoPlay
      style={style}
      src="/videos/croque-monsieur.mp4"
      onEnded={handleEnded}
      playsInline
    />
  );
}