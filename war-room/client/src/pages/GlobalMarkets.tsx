import { useState } from "react";
import { Globe, TrendingUp, Users, Package, ArrowRight, ShieldCheck, Zap, Building2, Map, DollarSign } from "lucide-react";

const PARTNERS = [
  { name: "NtechLab", country: "Russia", flag: "🇷🇺", sector: "AI & Biometrics", status: "active", deal: "Facial recognition for premium logistics" },
  { name: "ART Engineering MDC", country: "Russia", flag: "🇷🇺", sector: "Engineering", status: "active", deal: "Cold-chain infrastructure partnership" },
  { name: "Pharmasyntez", country: "Russia", flag: "🇷🇺", sector: "Pharmaceutical", status: "active", deal: "SA distribution network" },
  { name: "Project Phoenix", country: "South Africa", flag: "🇿🇦", sector: "Investment", status: "pending", deal: "JV structuring in progress" },
  { name: "AfricaBiz", country: "Pan-Africa", flag: "🌍", sector: "Trade Network", status: "active", deal: "SA-Russia Trade Week partnership" },
];

const MARKETS = [
  { region: "South Africa", flag: "🇿🇦", status: "PRIMARY", revenue: "R2.4M", growth: "+34%", color: "#C9A84C" },
  { region: "Russia", flag: "🇷🇺", status: "EXPANDING", revenue: "R890K", growth: "+112%", color: "#4CFFA8" },
  { region: "UAE / Dubai", flag: "🇦🇪", status: "PIPELINE", revenue: "—", growth: "Q3 2026", color: "#9a8a5a" },
  { region: "Europe", flag: "🇪🇺", status: "PIPELINE", revenue: "—", growth: "Q4 2026", color: "#9a8a5a" },
];

const PRODUCTS = [
  { name: "Wagyu Beef Export", grade: "A5 Certified", volume: "2.4T/mo", market: "Russia + UAE", margin: "68%" },
  { name: "Ankole Cattle", grade: "Heritage Breed", volume: "12 head/mo", market: "SA + Russia", margin: "74%" },
  { name: "Premium Biltong", grade: "Export Grade", volume: "800kg/mo", market: "SA + Europe", margin: "82%" },
  { name: "Wagyu Box Sets", grade: "VIP Luxury", volume: "60 boxes/mo", market: "SA + UAE", margin: "71%" },
];

export default function GlobalMarkets() {
  const [activeSection, setActiveSection] = useState<"overview" | "partners" | "products" | "trade">("overview");

  return (
    <div
      className="relative min-h-screen rounded overflow-hidden"
      style={{ background: "#0a0a0c" }}
    >
      {/* === SISTINE CHAPEL BACKGROUND === */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/creation-of-adam.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          backgroundRepeat: "no-repeat",
          filter: "grayscale(40%) brightness(0.18) sepia(30%)",
        }}
      />

      {/* Gold overlay gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(201,168,76,0.08) 0%, rgba(10,10,12,0.6) 40%, rgba(10,10,12,0.95) 100%)",
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">

        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5" style={{ color: "#C9A84C" }} />
            <span style={{ fontSize: "9px", letterSpacing: "5px", textTransform: "uppercase", color: "#9a8a5a", fontFamily: "'Helvetica Neue', sans-serif" }}>
              STUDEX GLOBAL MARKETS — COMMAND CENTRE
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 300,
              color: "#f5ecd0",
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
            }}
          >
            Premium Meat.<br />
            <span style={{ color: "#C9A84C", fontStyle: "italic" }}>Global Reach.</span>
          </h1>
          <p style={{ fontSize: "11px", color: "#9a8a5a", marginTop: "8px", letterSpacing: "1px" }}>
            SA–Russia Trade Week · AfricaBiz Partnership · B2B Export Platform
          </p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {[
            { id: "overview", label: "Overview" },
            { id: "partners", label: "Partners" },
            { id: "products", label: "Export Products" },
            { id: "trade", label: "Trade Routes" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id as any)}
              style={{
                fontSize: "9px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontFamily: "'Helvetica Neue', sans-serif",
                padding: "6px 14px",
                background: activeSection === s.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeSection === s.id ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.1)"}`,
                color: activeSection === s.id ? "#C9A84C" : "#9a8a5a",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            {MARKETS.map((m) => (
              <div
                key={m.region}
                style={{
                  background: "rgba(10,10,12,0.85)",
                  border: `1px solid ${m.color}30`,
                  padding: "16px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span style={{ fontSize: "20px" }}>{m.flag}</span>
                  <span
                    style={{
                      fontSize: "8px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: m.color,
                      border: `1px solid ${m.color}40`,
                      padding: "2px 6px",
                    }}
                  >
                    {m.status}
                  </span>
                </div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#f5ecd0", marginBottom: "4px", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  {m.region}
                </p>
                <p style={{ fontSize: "18px", fontFamily: "Menlo, monospace", color: m.color, fontWeight: 700 }}>
                  {m.revenue}
                </p>
                <p style={{ fontSize: "10px", color: "#9a8a5a", marginTop: "2px" }}>{m.growth}</p>
              </div>
            ))}

            {/* KPI Row */}
            <div
              className="md:col-span-2 xl:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[
                { label: "Total B2B Pipeline", value: "R4.8M", icon: DollarSign, trend: "+48% YoY" },
                { label: "Active Markets", value: "2 / 4", icon: Map, trend: "2 more Q3–Q4" },
                { label: "Export Partners", value: "5", icon: Building2, trend: "NtechLab, AfricaBiz..." },
                { label: "Trade Week Events", value: "3", icon: Zap, trend: "SA–Russia 2026" },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={kpi.label}
                    style={{
                      background: "rgba(201,168,76,0.05)",
                      border: "1px solid rgba(201,168,76,0.12)",
                      padding: "14px",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
                      <span style={{ fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8a5a" }}>{kpi.label}</span>
                    </div>
                    <p style={{ fontSize: "22px", fontFamily: "Menlo, monospace", color: "#C9A84C", fontWeight: 700 }}>{kpi.value}</p>
                    <p style={{ fontSize: "9px", color: "#9a8a5a", marginTop: "2px" }}>{kpi.trend}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PARTNERS */}
        {activeSection === "partners" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                style={{
                  background: "rgba(10,10,12,0.88)",
                  border: `1px solid ${p.status === "active" ? "rgba(76,255,168,0.2)" : "rgba(201,168,76,0.1)"}`,
                  padding: "18px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span style={{ fontSize: "18px", marginRight: "8px" }}>{p.flag}</span>
                    <span
                      style={{
                        fontSize: "9px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: p.status === "active" ? "#4CFFA8" : "#9a8a5a",
                        border: `1px solid ${p.status === "active" ? "rgba(76,255,168,0.3)" : "rgba(154,138,90,0.3)"}`,
                        padding: "2px 6px",
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                  <span style={{ fontSize: "9px", color: "#9a8a5a", textTransform: "uppercase", letterSpacing: "1px" }}>{p.country}</span>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#f5ecd0", marginBottom: "4px" }}>{p.name}</p>
                <p style={{ fontSize: "10px", color: "#C9A84C", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>{p.sector}</p>
                <p style={{ fontSize: "11px", color: "#9a8a5a", lineHeight: 1.5 }}>{p.deal}</p>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTS */}
        {activeSection === "products" && (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
                  {["Product", "Grade", "Monthly Volume", "Target Markets", "Margin"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8a5a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, i) => (
                  <tr
                    key={p.name}
                    style={{
                      borderBottom: "1px solid rgba(201,168,76,0.06)",
                      background: i % 2 === 0 ? "rgba(201,168,76,0.02)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px", fontSize: "13px", color: "#f5ecd0", fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: "12px", fontSize: "11px", color: "#C9A84C" }}>{p.grade}</td>
                    <td style={{ padding: "12px", fontSize: "12px", fontFamily: "Menlo, monospace", color: "#f5ecd0" }}>{p.volume}</td>
                    <td style={{ padding: "12px", fontSize: "11px", color: "#9a8a5a" }}>{p.market}</td>
                    <td style={{ padding: "12px", fontSize: "13px", fontFamily: "Menlo, monospace", color: "#4CFFA8", fontWeight: 700 }}>{p.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TRADE ROUTES */}
        {activeSection === "trade" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                from: "🇿🇦 South Africa",
                to: "🇷🇺 Russia",
                label: "SA–Russia Trade Corridor",
                status: "ACTIVE",
                volume: "3.2T/quarter",
                products: "Wagyu, Ankole, Biltong",
                events: ["SA–Russia Trade Week Jun 2026", "AfricaBiz Summit Q3"],
                color: "#4CFFA8",
              },
              {
                from: "🇿🇦 South Africa",
                to: "🇦🇪 UAE / Dubai",
                label: "SA–UAE Premium Route",
                status: "PIPELINE",
                volume: "Est. 1.8T/quarter",
                products: "VIP Wagyu Boxes, Tomahawk",
                events: ["Target Q3 2026 launch", "Dubai Food Expo shortlist"],
                color: "#9a8a5a",
              },
            ].map((route) => (
              <div
                key={route.label}
                style={{
                  background: "rgba(10,10,12,0.88)",
                  border: `1px solid ${route.color}25`,
                  padding: "20px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ fontSize: "18px" }}>{route.from.split(" ")[0]}</span>
                  <ArrowRight className="w-4 h-4" style={{ color: route.color }} />
                  <span style={{ fontSize: "18px" }}>{route.to.split(" ")[0]}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "8px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: route.color,
                      border: `1px solid ${route.color}40`,
                      padding: "2px 8px",
                    }}
                  >
                    {route.status}
                  </span>
                </div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#f5ecd0", marginBottom: "8px" }}>{route.label}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p style={{ fontSize: "8px", color: "#9a8a5a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>Volume</p>
                    <p style={{ fontSize: "13px", fontFamily: "Menlo, monospace", color: route.color }}>{route.volume}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "8px", color: "#9a8a5a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>Products</p>
                    <p style={{ fontSize: "11px", color: "#f5ecd0" }}>{route.products}</p>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid rgba(201,168,76,0.1)", paddingTop: "12px" }}>
                  <p style={{ fontSize: "8px", color: "#9a8a5a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Events</p>
                  {route.events.map((e) => (
                    <div key={e} className="flex items-center gap-2 mb-1">
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: route.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "11px", color: "#9a8a5a" }}>{e}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
