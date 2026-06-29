import { colors, fonts } from "@/lib/theme";

interface Tab {
  id: string;
  label: string;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeId: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function TabSwitcher({ tabs, activeId, onTabChange, className }: TabSwitcherProps) {
  return (
    <div className={`flex gap-1 ${className ?? ""}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            fontSize: "9px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontFamily: fonts.body,
            padding: "6px 14px",
            background: activeId === tab.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${activeId === tab.id ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.1)"}`,
            color: activeId === tab.id ? colors.gold : colors.goldDim,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
