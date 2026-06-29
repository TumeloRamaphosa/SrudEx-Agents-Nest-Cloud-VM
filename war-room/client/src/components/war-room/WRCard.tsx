import { colors } from "@/lib/theme";

interface WRCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function WRCard({ children, style, ...props }: WRCardProps) {
  return (
    <div
      style={{
        background: colors.obsidian2,
        border: `1px solid rgba(201,168,76,0.25)`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
