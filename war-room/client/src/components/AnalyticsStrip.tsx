import { usePrivacy } from "@/contexts/PrivacyContext";
import { Eye, EyeOff, Mail } from "lucide-react";
import studexLogoGold from "@assets/studex-logo-gold.png";
import { useQuery } from "@tanstack/react-query";

interface ShopifyStats {
  revenue: number;
  orders: number;
  topProduct: string;
}

interface ShopifyToday {
  orders: number;
  revenue: number;
  topOrder: string;
}

export function AnalyticsStrip() {
  const { isPrivate, togglePrivacy, mask } = usePrivacy();

  const { data: shopify } = useQuery<ShopifyStats>({
    queryKey: ["/api/analytics/shopify"],
  });

  const { data: today } = useQuery<ShopifyToday>({
    queryKey: ["/api/shopify/today"],
  });

  const stats = [
    {
      label: "Today's Revenue",
      value: `R${mask(today?.revenue?.toLocaleString("en-ZA") ?? "43,585")}`,
      color: "#a68a2e",
    },
    {
      label: "Orders Today",
      value: mask(String(today?.orders ?? shopify?.orders ?? 4)),
      color: "#a68a2e",
    },
    {
      label: "Unfulfilled",
      value: mask("37"),
      color: "#c14e3c",
    },
    {
      label: "IG Followers",
      value: mask("5,318"),
      color: "#a68a2e",
    },
    {
      label: "Active Ads",
      value: mask("1"),
      color: "#6fa84f",
    },
  ];

  return (
    <div
      className="sticky top-0 z-50"
      style={{
        background: "rgba(255,255,255,0.95)",
        borderBottom: "1px solid rgba(166,138,46,0.15)",
        backdropFilter: "blur(8px)",
      }}
      data-testid="analytics-strip"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src={studexLogoGold}
            alt="StudEx Meat"
            className="w-8 h-8 object-contain"
            aria-label="StudEx Meat logo"
          />
          <div className="hidden sm:block">
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: "italic",
                fontSize: "16px",
                fontWeight: 500,
                color: "#1a1710",
                lineHeight: 1.2,
                letterSpacing: "0.5px",
              }}
            >
              Studex Meat <span style={{ color: "#a68a2e" }}>·</span> War Room
            </p>
            <a
              href="mailto:info@studexmeat.com"
              style={{
                fontFamily: "'Menlo', monospace",
                fontSize: "9px",
                color: "#5a5040",
                textDecoration: "none",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Mail size={9} style={{ color: "#a68a2e" }} />
              info@studexmeat.com
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 flex-1 justify-center flex-wrap">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col leading-tight"
              data-testid={`stat-${s.label.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: "#7a6e52",
                  fontFamily: "'Helvetica Neue', sans-serif",
                }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: "'Menlo', 'Monaco', monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: isPrivate ? "#7a6e52" : s.color,
                  filter: isPrivate ? "blur(4px)" : "none",
                  userSelect: isPrivate ? "none" : "auto",
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Privacy toggle */}
        <button
          onClick={togglePrivacy}
          className="flex items-center gap-1.5 px-3 py-1.5 transition-colors shrink-0"
          style={{
            background: "transparent",
            border: "1px solid rgba(166,138,46,0.25)",
            color: "#7a6e52",
            fontSize: "9px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontFamily: "'Helvetica Neue', sans-serif",
          }}
          title={isPrivate ? "Show numbers" : "Hide numbers"}
          data-testid="button-privacy-toggle"
        >
          {isPrivate ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:block">{isPrivate ? "Reveal" : "Privacy"}</span>
        </button>
      </div>
    </div>
  );
}
