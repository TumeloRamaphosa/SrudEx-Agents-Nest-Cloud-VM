import { useState } from "react";
import { TrendingUp, Users, RefreshCw, DollarSign, AlertCircle, CheckCircle, Plus, BarChart3, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { usePrivacy } from "@/contexts/PrivacyContext";

// Subscription tiers
const TIERS = [
  { id: "meat-os", name: "Meat OS", price: 8500, color: "#C9A84C", agents: 4 },
  { id: "agency-os", name: "Agency OS", price: 18500, color: "#4CFFA8", agents: 8 },
  { id: "marketplace-os", name: "Marketplace OS", price: 24000, color: "#E6C766", agents: 11 },
];

// Mock subscribers (will be live once clients come in)
const SUBSCRIBERS: any[] = [];

// Google Ads data (live — last 5 days)
const GADS_DATA = [
  { date: "Jun 6", spend: 14.06, impressions: 22221, clicks: 378, conversions: 3, revenue: 12400, roas: 882 },
  { date: "Jun 7", spend: 14.14, impressions: 31191, clicks: 326, conversions: 0, revenue: 0, roas: 0 },
  { date: "Jun 8", spend: 27.51, impressions: 89994, clicks: 527, conversions: 1, revenue: 5100, roas: 185 },
  { date: "Jun 9", spend: 26.92, impressions: 70598, clicks: 430, conversions: 0, revenue: 0, roas: 0 },
  { date: "Jun 10", spend: 27.12, impressions: 82032, clicks: 489, conversions: 2, revenue: 1650, roas: 61 },
];

const CAMPAIGN_STATUS = [
  { name: "STU-PMAX-SALES", type: "Performance Max", status: "LIMITED", spend: "R27/day", note: "⚠️ ROAS dropped after Jun 6 — check feed/audience" },
  { name: "STU-SRCH-BRAND", type: "Brand Search", status: "ELIGIBLE", spend: "R0.10/day", note: "Brand protection only" },
  { name: "STU-SRCH-GEN", type: "Generic Search", status: "PAUSED", spend: "—", note: "Reactivate for growth" },
  { name: "STU-SHOP-ALL", type: "Shopping", status: "PAUSED", spend: "—", note: "Reactivate — product feed ready" },
  { name: "STU-DISPLAY", type: "Display", status: "PAUSED", spend: "—", note: "Boss Braai Box creative ready" },
  { name: "Father's Day", type: "Facebook", status: "ACTIVE", spend: "R100/day", note: "Jun 15 deadline — 4 days left" },
];

const PROJECTIONS = [
  { clients: 1, tier: "Meat OS", mrr: 8500 },
  { clients: 3, tier: "Mixed", mrr: 28500 },
  { clients: 5, tier: "Mixed", mrr: 52500 },
  { clients: 10, tier: "Mixed", mrr: 120000 },
  { clients: 20, tier: "Mixed", mrr: 240000 },
];

export default function RevenueEngine() {
  const [view, setView] = useState<"overview" | "ads" | "subscriptions" | "projections">("overview");
  const { isPrivate } = usePrivacy();
  const mask = (v: string) => isPrivate ? "••••••" : v;

  const totalSpend5d = GADS_DATA.reduce((s, d) => s + d.spend, 0);
  const totalRevenue5d = GADS_DATA.reduce((s, d) => s + d.revenue, 0);
  const totalConversions = GADS_DATA.reduce((s, d) => s + d.conversions, 0);
  const avgRoas = totalSpend5d > 0 ? totalRevenue5d / totalSpend5d : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" style={{ color: "#C9A84C" }} />
          <span style={{ fontSize: "9px", letterSpacing: "5px", textTransform: "uppercase", color: "#9a8a5a", fontFamily: "'Helvetica Neue', sans-serif" }}>
            REVENUE ENGINE — ADS + SUBSCRIPTIONS
          </span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 300, color: "#f5ecd0" }}>
          Revenue Intelligence
        </h2>
        <p style={{ fontSize: "11px", color: "#9a8a5a", marginTop: "2px" }}>Google Ads · Facebook Ads · Super Agents MRR · Shopify</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Google Ads Spend (5d)", value: mask(`R${totalSpend5d.toFixed(2)}`), sub: "Jun 6–10", color: "#9a8a5a", icon: DollarSign },
          { label: "Google Conv. Value (5d)", value: mask(`R${totalRevenue5d.toLocaleString()}`), sub: `${totalConversions} conversions`, color: "#4CFFA8", icon: ArrowUpRight },
          { label: "Blended ROAS (5d)", value: `${avgRoas.toFixed(0)}×`, sub: "Jun 6: 882× best day", color: avgRoas > 10 ? "#4CFFA8" : "#c14e3c", icon: BarChart3 },
          { label: "Super Agents MRR", value: mask("R0"), sub: "0 clients — Phase 2 target", color: "#C9A84C", icon: Users },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} style={{ background: "rgba(201,168,76,0.04)", border: `1px solid ${kpi.color}20`, padding: "14px" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3 h-3" style={{ color: kpi.color }} />
                <span style={{ fontSize: "8px", letterSpacing: "1px", textTransform: "uppercase", color: "#9a8a5a" }}>{kpi.label}</span>
              </div>
              <p style={{ fontSize: "20px", fontFamily: "Menlo, monospace", color: kpi.color, fontWeight: 700 }}>{kpi.value}</p>
              <p style={{ fontSize: "9px", color: "#9a8a5a", marginTop: "2px" }}>{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Critical PMAX alert */}
      <div style={{ background: "rgba(193,78,60,0.06)", border: "1px solid rgba(193,78,60,0.25)", padding: "12px 16px", display: "flex", gap: "10px" }}>
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#c14e3c" }} />
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#f5ecd0", marginBottom: "2px" }}>
            Google PMAX — ROAS Collapsed After Jun 6
          </p>
          <p style={{ fontSize: "11px", color: "#9a8a5a" }}>
            Jun 6: R14 spend → R12,400 revenue (882× ROAS). Jun 7–10: R96 spend → R6,750 revenue (70× avg). Campaign is marked <strong style={{ color: "#c14e3c" }}>LIMITED</strong> — check your Google Merchant Center product feed and audience signals in Google Ads.
          </p>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 flex-wrap">
        {[
          { id: "overview", label: "Ad Overview" },
          { id: "ads", label: "Campaign Detail" },
          { id: "subscriptions", label: "Subscriptions" },
          { id: "projections", label: "MRR Projections" },
        ].map((v) => (
          <button key={v.id} onClick={() => setView(v.id as any)} style={{
            fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Helvetica Neue', sans-serif",
            padding: "6px 14px",
            background: view === v.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${view === v.id ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.1)"}`,
            color: view === v.id ? "#C9A84C" : "#9a8a5a", cursor: "pointer",
          }}>{v.label}</button>
        ))}
      </div>

      {/* AD OVERVIEW — Daily table */}
      {view === "overview" && (
        <div className="overflow-x-auto">
          <p style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8a5a", marginBottom: "8px" }}>GOOGLE ADS — DAILY PERFORMANCE</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
                {["Date", "Spend", "Impressions", "Clicks", "CTR", "Conversions", "Revenue", "ROAS"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8a5a" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GADS_DATA.map((d) => (
                <tr key={d.date} style={{ borderBottom: "1px solid rgba(201,168,76,0.05)", background: d.date === "Jun 6" ? "rgba(76,255,168,0.03)" : "transparent" }}>
                  <td style={{ padding: "10px", fontSize: "12px", color: d.date === "Jun 6" ? "#4CFFA8" : "#f5ecd0", fontWeight: d.date === "Jun 6" ? 600 : 400 }}>{d.date}{d.date === "Jun 6" ? " ★" : ""}</td>
                  <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", color: "#f5ecd0" }}>{mask(`R${d.spend.toFixed(2)}`)}</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>{d.impressions.toLocaleString()}</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>{d.clicks}</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>{(d.clicks / d.impressions * 100).toFixed(2)}%</td>
                  <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", color: d.conversions > 0 ? "#4CFFA8" : "#9a8a5a" }}>{d.conversions}</td>
                  <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", color: d.revenue > 0 ? "#4CFFA8" : "#9a8a5a" }}>{mask(d.revenue > 0 ? `R${d.revenue.toLocaleString()}` : "—")}</td>
                  <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", fontWeight: 700, color: d.roas > 100 ? "#4CFFA8" : d.roas > 0 ? "#C9A84C" : "#9a8a5a" }}>
                    {d.roas > 0 ? `${d.roas}×` : "—"}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: "1px solid rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "11px", color: "#C9A84C", fontWeight: 600 }}>TOTAL</td>
                <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", color: "#C9A84C", fontWeight: 700 }}>{mask(`R${totalSpend5d.toFixed(2)}`)}</td>
                <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>{GADS_DATA.reduce((s,d)=>s+d.impressions,0).toLocaleString()}</td>
                <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>{GADS_DATA.reduce((s,d)=>s+d.clicks,0)}</td>
                <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>—</td>
                <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", color: "#4CFFA8", fontWeight: 700 }}>{totalConversions}</td>
                <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", color: "#4CFFA8", fontWeight: 700 }}>{mask(`R${totalRevenue5d.toLocaleString()}`)}</td>
                <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", fontWeight: 700, color: avgRoas > 10 ? "#4CFFA8" : "#c14e3c" }}>{avgRoas.toFixed(0)}×</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* CAMPAIGN DETAIL */}
      {view === "ads" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CAMPAIGN_STATUS.map((c) => (
            <div key={c.name} style={{
              background: c.status === "ACTIVE" ? "rgba(76,255,168,0.04)" : c.status === "LIMITED" ? "rgba(193,78,60,0.05)" : "rgba(201,168,76,0.02)",
              border: `1px solid ${c.status === "ACTIVE" ? "rgba(76,255,168,0.2)" : c.status === "LIMITED" ? "rgba(193,78,60,0.2)" : "rgba(201,168,76,0.08)"}`,
              padding: "14px",
            }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#f5ecd0" }}>{c.name}</p>
                  <p style={{ fontSize: "9px", color: "#9a8a5a", textTransform: "uppercase", letterSpacing: "1px" }}>{c.type}</p>
                </div>
                <span style={{
                  fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", padding: "2px 6px",
                  color: c.status === "ACTIVE" ? "#4CFFA8" : c.status === "ELIGIBLE" ? "#4CFFA8" : c.status === "LIMITED" ? "#c14e3c" : "#9a8a5a",
                  border: `1px solid ${c.status === "ACTIVE" || c.status === "ELIGIBLE" ? "rgba(76,255,168,0.3)" : c.status === "LIMITED" ? "rgba(193,78,60,0.3)" : "rgba(154,138,90,0.2)"}`,
                }}>{c.status}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span style={{ fontSize: "10px", fontFamily: "Menlo, monospace", color: "#C9A84C" }}>{c.spend}</span>
                <span style={{ fontSize: "10px", color: "#9a8a5a", fontStyle: "italic" }}>{c.note}</span>
              </div>
            </div>
          ))}
          <div style={{ border: "1px dashed rgba(201,168,76,0.2)", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", opacity: 0.6 }}>
            <Plus className="w-3 h-3" style={{ color: "#9a8a5a" }} />
            <span style={{ fontSize: "10px", color: "#9a8a5a" }}>Reactivate paused campaigns</span>
          </div>
        </div>
      )}

      {/* SUBSCRIPTIONS */}
      {view === "subscriptions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TIERS.map((t) => (
              <div key={t.id} style={{ background: `${t.color}06`, border: `1px solid ${t.color}20`, padding: "18px" }}>
                <p style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: t.color, marginBottom: "4px" }}>{t.name}</p>
                <p style={{ fontSize: "28px", fontFamily: "Menlo, monospace", color: t.color, fontWeight: 700 }}>R{t.price.toLocaleString()}</p>
                <p style={{ fontSize: "9px", color: "#9a8a5a", marginBottom: "12px" }}>per month · {t.agents} agents</p>
                <div style={{ borderTop: "1px solid rgba(201,168,76,0.1)", paddingTop: "12px" }}>
                  <p style={{ fontSize: "10px", color: "#9a8a5a" }}>Active subscribers</p>
                  <p style={{ fontSize: "24px", fontFamily: "Menlo, monospace", color: "#9a8a5a", fontWeight: 700 }}>0</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)", padding: "16px" }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3 h-3" style={{ color: "#C9A84C" }} />
              <span style={{ fontSize: "10px", color: "#C9A84C", textTransform: "uppercase", letterSpacing: "2px" }}>HOW TO ADD A SUBSCRIBER</span>
            </div>
            <p style={{ fontSize: "11px", color: "#9a8a5a", lineHeight: 1.6 }}>
              When a client signs up, send a WhatsApp or email with their War Room access. They pay via PayFast recurring billing. Subscription tracked here automatically once CashClaw billing is wired.
            </p>
          </div>
        </div>
      )}

      {/* PROJECTIONS */}
      {view === "projections" && (
        <div className="space-y-3">
          <p style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8a5a", marginBottom: "8px" }}>SUPER AGENTS — MRR GROWTH PATHWAY</p>
          {PROJECTIONS.map((p, i) => (
            <div key={p.clients} style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "rgba(201,168,76,0.03)", border: "1px solid rgba(201,168,76,0.08)", padding: "12px 16px",
            }}>
              <div style={{ minWidth: "80px" }}>
                <p style={{ fontSize: "22px", fontFamily: "Menlo, monospace", color: "#C9A84C", fontWeight: 700 }}>{p.clients}</p>
                <p style={{ fontSize: "9px", color: "#9a8a5a" }}>clients</p>
              </div>
              <div style={{ flex: 1, height: "4px", background: "rgba(201,168,76,0.1)", position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(p.mrr / 240000) * 100}%`, background: i === 0 ? "#9a8a5a" : "#C9A84C", transition: "width 0.3s" }} />
              </div>
              <div style={{ minWidth: "110px", textAlign: "right" }}>
                <p style={{ fontSize: "16px", fontFamily: "Menlo, monospace", color: "#4CFFA8", fontWeight: 700 }}>{mask(`R${p.mrr.toLocaleString()}`)}</p>
                <p style={{ fontSize: "9px", color: "#9a8a5a" }}>MRR</p>
              </div>
            </div>
          ))}
          <div style={{ marginTop: "12px", padding: "12px 16px", background: "rgba(76,255,168,0.04)", border: "1px solid rgba(76,255,168,0.15)" }}>
            <p style={{ fontSize: "11px", color: "#4CFFA8", fontWeight: 600 }}>R240,000 MRR = R2.88M ARR</p>
            <p style={{ fontSize: "10px", color: "#9a8a5a", marginTop: "4px" }}>Target: 20 clients by end of 2027 · Current: 0 (StudEx is client #1)</p>
          </div>
        </div>
      )}
    </div>
  );
}
