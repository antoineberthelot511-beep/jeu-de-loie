type Tab = {
  id: string;
  label: string;
};

type TabBarProps = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
};

export default function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`tab-bar-item ${active === tab.id ? "is-active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
