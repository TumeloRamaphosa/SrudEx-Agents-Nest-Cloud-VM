import { colors, fonts } from "@/lib/theme";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h1
        style={{
          fontFamily: fonts.label,
          fontSize: "36px",
          fontWeight: 700,
          letterSpacing: "8px",
          textTransform: "uppercase",
          color: colors.gold,
          margin: 0,
          lineHeight: 1,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontFamily: fonts.heading,
          fontStyle: "italic",
          fontSize: "12px",
          color: colors.goldDim,
          marginTop: "6px",
          letterSpacing: "1px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
