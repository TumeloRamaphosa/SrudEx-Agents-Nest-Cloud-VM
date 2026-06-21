// War Room — shared color palette and typography tokens
// Used across all War Room dashboard pages

export const colors = {
  gold: "#C9A84C",
  goldDim: "#9a8a5a",
  goldDark: "#5a4f2e",
  cream: "#f5ecd0",
  green: "#6fa84f",
  greenBright: "#4CFFA8",
  red: "#c14e3c",
  obsidian1: "#0e0d10",
  obsidian2: "#15140e",
  obsidian3: "#1f1d15",
  discord: "#5865F2",
  whatsapp: "#25D366",
  gmail: "#EA4335",
} as const;

export const fonts = {
  heading: "'Cormorant Garamond', Georgia, serif",
  label: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
  mono: "'Menlo', 'Monaco', monospace",
  body: "'Helvetica Neue', sans-serif",
} as const;

export const borders = {
  goldSubtle: `1px solid rgba(201,168,76,0.08)`,
  goldLight: `1px solid rgba(201,168,76,0.12)`,
  goldMedium: `1px solid rgba(201,168,76,0.25)`,
  goldStrong: `1px solid rgba(201,168,76,0.5)`,
  redSubtle: `1px solid rgba(193,78,60,0.4)`,
  greenSubtle: `1px solid rgba(111,168,79,0.5)`,
} as const;
