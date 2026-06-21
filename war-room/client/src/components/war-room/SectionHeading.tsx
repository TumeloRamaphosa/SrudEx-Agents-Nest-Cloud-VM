import { fonts, colors } from "@/lib/theme";

interface SectionHeadingProps {
  children: React.ReactNode;
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2
      style={{
        fontFamily: fonts.label,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "4px",
        textTransform: "uppercase",
        color: colors.goldDim,
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}
