type TopBarItem = {
  label: string;
  value: string;
};

type TopBarProps = {
  title?: string;
  items?: TopBarItem[];
  children?: React.ReactNode;
};

export default function TopBar({ title, items = [], children }: TopBarProps) {
  return (
    <div className="glass-bar">
      <div className="glass-bar-inner">
        {title && (
          <div className="glass-bar-item">
            <span className="glass-bar-value" style={{ fontWeight: 700 }}>
              {title}
            </span>
          </div>
        )}
        {items.map((item) => (
          <div key={item.label} className="glass-bar-item is-end">
            <span className="glass-bar-label">{item.label}</span>
            <span className="glass-bar-value">{item.value}</span>
          </div>
        ))}
      </div>
      {children && <div className="glass-bar-tabs">{children}</div>}
    </div>
  );
}
