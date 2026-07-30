import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dark Factory | Automated Agent Development",
  description:
    "Submit your project via voice or text. AI agents scope, build, review, and ship your code.",
  openGraph: {
    title: "Dark Factory | Automated Agent Development",
    description: "AI agents build your software. Voice-first intake. Ship in days, not months.",
    siteName: "Dark Factory",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
