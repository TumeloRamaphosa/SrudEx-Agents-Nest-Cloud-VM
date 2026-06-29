import { fonts } from "@/lib/theme";

interface StatusBadgeProps {
  label: string;
  color: string;
  glow?: boolean;
}

export function StatusBadge({ label, color, glow = false }: StatusBadgeProps) {
  return (
    <span
      style={{
        fontFamily: fonts.label,
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color,
        background: `${color}14`,
        border: `1px solid ${color}4D`,
        padding: "2px 8px",
        borderRadius: "2px",
        boxShadow: glow ? `0 0 8px ${color}33` : "none",
      }}
    >
      {label}
    </span>
  );
}
