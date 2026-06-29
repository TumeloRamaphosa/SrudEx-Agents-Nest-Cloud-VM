import { colors, fonts } from "@/lib/theme";

interface WRLabelProps {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}

export function WRLabel({ children, color = colors.gold, style }: WRLabelProps) {
  return (
    <span
      style={{
        fontSize: "9px",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color,
        fontFamily: fonts.body,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
