"use client";

import { useEffect, useState } from "react";

type ImpactBurstProps = {
  trigger: number;
};

const STAR_OFFSETS = [
  { x: 60, y: -55 },
  { x: -65, y: -40 },
  { x: 55, y: 50 },
  { x: -55, y: 50 },
  { x: 0, y: -75 },
  { x: 5, y: 75 },
];

export default function ImpactBurst({ trigger }: ImpactBurstProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger <= 0) return;
    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(timeout);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div className="impact-layer">
      <span className="impact-pow">POW !</span>
      {STAR_OFFSETS.map((offset, i) => (
        <span
          key={`${trigger}-${i}`}
          className="impact-star"
          style={{ "--star-x": `${offset.x}px`, "--star-y": `${offset.y}px` } as React.CSSProperties}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
