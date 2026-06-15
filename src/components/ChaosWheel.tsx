"use client";

import { useState } from "react";

const SEGMENTS = [1, 2, 3, 4, 5, 6];
const SEGMENT_COLORS = ["#ff3864", "#3a86ff", "#ffd23f", "#06d6a0", "#b14aff", "#ff8c42"];

const WHEEL_BACKGROUND = `conic-gradient(${SEGMENT_COLORS.map(
  (color, i) => `${color} ${i * 60}deg ${(i + 1) * 60}deg`
).join(", ")})`;

// Le pointeur est fixe en haut de la roue. Le centre du segment `value`
// (1-indexé) se trouve à l'angle (value-1)*60 + 30 dans le repère de la roue.
// Pour amener ce segment sous le pointeur, on fait tourner la roue de
// l'angle complémentaire.
function angleForValue(value: number) {
  const segmentCenter = (value - 1) * 60 + 30;
  return (360 - segmentCenter) % 360;
}

type ChaosWheelProps = {
  // Résultat déjà connu (tour précédent ou en cours), null si pas encore lancé.
  value: number | null;
  disabled?: boolean;
  onResult: (value: number) => void;
};

export default function ChaosWheel({ value, disabled, onResult }: ChaosWheelProps) {
  const [rotation, setRotation] = useState(() => (value !== null ? angleForValue(value) : 0));
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    if (spinning || disabled) return;

    const result = 1 + Math.floor(Math.random() * 6);
    const target = angleForValue(result);
    const extraSpins = 4 + Math.floor(Math.random() * 2); // 4-5 tours complets
    const delta = ((target - (rotation % 360)) + 360) % 360;

    setSpinning(true);
    setRotation((prev) => prev + extraSpins * 360 + delta);

    const audio = new Audio("/sons/wheel.mp3");
    void audio.play().catch(() => {});

    onResult(result);

    window.setTimeout(() => setSpinning(false), 2600);
  };

  return (
    <div className="chaos-wheel-wrap">
      <div className="chaos-wheel-pointer">▼</div>

      <div
        className="chaos-wheel"
        style={{
          background: WHEEL_BACKGROUND,
          transform: `rotate(${rotation}deg)`,
          transitionDuration: spinning ? "2.4s" : "0s",
        }}
      >
        {SEGMENTS.map((n, i) => (
          <div
            key={n}
            className="chaos-wheel-segment"
            style={{ transform: `rotate(${i * 60 + 30}deg)` }}
          >
            <span className="chaos-wheel-number">{n}</span>
          </div>
        ))}
        <div className="chaos-wheel-hub">🎡</div>
      </div>

      <button
        type="button"
        onClick={handleSpin}
        disabled={disabled || spinning}
        className="btn-pill btn-pill-primary w-full"
      >
        {spinning ? "La roue tourne…" : "Tourner la roue"}
      </button>
    </div>
  );
}
