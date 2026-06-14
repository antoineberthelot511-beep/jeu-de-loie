type HealthBarProps = {
  value: number;
  max: number;
  variant?: "boss" | "player";
};

export default function HealthBar({ value, max, variant = "player" }: HealthBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div className="health-bar">
      <div className={`health-bar-fill is-${variant}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
