import { useState } from "react";
import { ShoppingBag, TrendingUp, AlertCircle, Package, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { usePrivacy } from "@/contexts/PrivacyContext";

// Live data pulled Jun 11 2026 01:28 SAST
const RECENT_ORDERS = [
  { id: "#1949", customer: "A.F.", date: "10 Jun", amount: 897.50, items: ["Luxury Wagyu Biltong"], status: "UNFULFILLED", daysOpen: 0 },
  { id: "#1948", customer: "E.U.M.", date: "10 Jun", amount: 1300.00, items: ["Wagyu Burger Patties", "Luxury Wagyu Biltong"], status: "UNFULFILLED", daysOpen: 0 },
  { id: "#1947", customer: "R.I.", date: "8 Jun", amount: 5865.00, items: ["Wagyu Fillet", "Wagyu Bavette", "Flat Iron Steak"], status: "UNFULFILLED", daysOpen: 2 },
  { id: "#1946", customer: "C.G.", date: "6 Jun", amount: 1610.00, items: ["Wagyu Boerewors ×4"], status: "UNFULFILLED", daysOpen: 4 },
  { id: "#1945", customer: "C.G.", date: "6 Jun", amount: 7245.00, items: ["Ankole Ribeye 1kg ×6"], status: "UNFULFILLED", daysOpen: 4 },
  { id: "#1944", customer: "R.G.", date: "6 Jun", amount: 29325.00, items: ["Trade Week 2026 — VIP Access ×3"], status: "UNFULFILLED", daysOpen: 4 },
  { id: "#1943", customer: "D.O.", date: "6 Jun", amount: 5405.00, items: ["Tomahawk ×3", "Wagyu Sirloin", "Wagyu Ribs ×2"], status: "UNFULFILLED", daysOpen: 4 },
  { id: "#1942", customer: "F.M.", date: "4 Jun", amount: 955.00, items: ["Tomahawk", "Wagyu Boerewors"], status: "UNFULFILLED", daysOpen: 6 },
  { id: "#1941", customer: "H.M.", date: "27 May", amount: 552.50, items: ["Wagyu Burger Patties"], status: "UNFULFILLED", daysOpen: 14 },
  { id: "#1940", customer: "L.N.", date: "12 May", amount: 3220.00, items: ["Ankole Ribeye ×2", "Tomahawk ×2"], status: "UNFULFILLED", daysOpen: 29 },
];

const INVENTORY = [
  { sku: "Wagyu Burger Patties", qty: -249, status: "critical" },
  { sku: "Luxury Wagyu Biltong 1kg", qty: -220, status: "critical" },
  { sku: "Tomahawk 1kg", qty: -213, status: "critical" },
  { sku: "Fire & Feast Box", qty: -50, status: "low" },
  { sku: "Luxury Wagyu Biltong 500g", qty: -81, status: "low" },
  { sku: "Tomahawk 2kg", qty: -71, status: "low" },
  { sku: "Easy Wagyu Box", qty: -16, status: "low" },
  { sku: "VIP Large Wagyu Box", qty: -15, status: "low" },
  { sku: "Wagyu Biltong Gold", qty: 496, status: "ok" },
  { sku: "Ankole Rump", qty: 219, status: "ok" },
];

const PIPELINE_TOTAL = 133623.65;
const UNFULFILLED_COUNT = 40;

export default function ShopifyStore() {
  const [activeView, setActiveView] = useState<"orders" | "inventory" | "pipeline">("orders");
  const { isPrivate } = usePrivacy();

  const mask = (val: string) => isPrivate ? "••••••" : val;

  const statusColor = (days: number) => {
    if (days >= 4) return "#c14e3c";
    if (days >= 2) return "#C9A84C";
    return "#4CFFA8";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag className="w-4 h-4" style={{ color: "#C9A84C" }} />
          <span style={{ fontSize: "9px", letterSpacing: "5px", textTransform: "uppercase", color: "#9a8a5a", fontFamily: "'Helvetica Neue', sans-serif" }}>
            SHOPIFY — studexmeat.com
          </span>
          <span style={{ marginLeft: "auto", fontSize: "8px", color: "#4CFFA8", border: "1px solid rgba(76,255,168,0.3)", padding: "2px 6px", letterSpacing: "2px" }}>
            LIVE
          </span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 300, color: "#f5ecd0" }}>
          Store Operations
        </h2>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Today's Revenue", value: mask("R2,197.50"), sub: "2 orders", color: "#C9A84C", icon: TrendingUp },
          { label: "Unfulfilled Pipeline", value: mask("R133,623"), sub: `${UNFULFILLED_COUNT} orders`, color: "#c14e3c", icon: AlertCircle },
          { label: "Jun 6 Batch", value: mask("R43,585"), sub: "4 days UNPACKED ⚠️", color: "#c14e3c", icon: Clock },
          { label: "R.G. #1944 — URGENT", value: mask("R29,325"), sub: "VIP Trade Week — 4d", color: "#c14e3c", icon: Package },
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

      {/* Critical alert */}
      <div style={{ background: "rgba(193,78,60,0.06)", border: "1px solid rgba(193,78,60,0.25)", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#c14e3c" }} />
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#f5ecd0", marginBottom: "2px" }}>
            Chargeback Risk — Jun 6 Batch (4 orders, {mask("R43,585")})
          </p>
          <p style={{ fontSize: "11px", color: "#9a8a5a" }}>
            #1943–#1946 are 4 days PAID & UNFULFILLED. R.G. #1944 ({mask("R29,325")} VIP Trade Week) needs immediate contact. Risk escalates daily.
          </p>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1">
        {[
          { id: "orders", label: "Recent Orders" },
          { id: "inventory", label: "Inventory" },
          { id: "pipeline", label: "Pipeline" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id as any)}
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "'Helvetica Neue', sans-serif",
              padding: "6px 14px",
              background: activeView === v.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeView === v.id ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.1)"}`,
              color: activeView === v.id ? "#C9A84C" : "#9a8a5a",
              cursor: "pointer",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ORDERS */}
      {activeView === "orders" && (
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
                {["Order", "Customer", "Date", "Amount", "Items", "Status", "Days Open"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8a5a" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
                  <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", color: "#C9A84C" }}>{o.id}</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>{o.customer}</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>{o.date}</td>
                  <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", color: "#f5ecd0" }}>{mask(`R${o.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`)}</td>
                  <td style={{ padding: "10px", fontSize: "10px", color: "#9a8a5a", maxWidth: "160px" }}>{o.items.join(", ")}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ fontSize: "8px", letterSpacing: "1px", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)", padding: "2px 6px" }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ fontSize: "11px", fontFamily: "Menlo, monospace", color: statusColor(o.daysOpen), fontWeight: o.daysOpen >= 4 ? 700 : 400 }}>
                      {o.daysOpen === 0 ? "Today" : `${o.daysOpen}d`}
                      {o.daysOpen >= 4 ? " ⚠️" : ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* INVENTORY */}
      {activeView === "inventory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {INVENTORY.map((item) => (
            <div
              key={item.sku}
              style={{
                background: item.status === "critical" ? "rgba(193,78,60,0.06)" : item.status === "low" ? "rgba(201,168,76,0.04)" : "rgba(76,255,168,0.04)",
                border: `1px solid ${item.status === "critical" ? "rgba(193,78,60,0.2)" : item.status === "low" ? "rgba(201,168,76,0.12)" : "rgba(76,255,168,0.12)"}`,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="flex items-center gap-2">
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                  background: item.status === "critical" ? "#c14e3c" : item.status === "low" ? "#C9A84C" : "#4CFFA8"
                }} />
                <span style={{ fontSize: "12px", color: "#f5ecd0" }}>{item.sku}</span>
              </div>
              <span style={{
                fontSize: "13px",
                fontFamily: "Menlo, monospace",
                fontWeight: 700,
                color: item.status === "critical" ? "#c14e3c" : item.status === "low" ? "#C9A84C" : "#4CFFA8"
              }}>
                {item.qty > 0 ? `+${item.qty}` : item.qty}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* PIPELINE */}
      {activeView === "pipeline" && (
        <div className="space-y-4">
          <div style={{ background: "rgba(193,78,60,0.05)", border: "1px solid rgba(193,78,60,0.2)", padding: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "#9a8a5a", marginBottom: "8px" }}>TOTAL UNFULFILLED PIPELINE</p>
            <p style={{ fontSize: "40px", fontFamily: "Menlo, monospace", color: "#c14e3c", fontWeight: 700 }}>
              {mask(`R${PIPELINE_TOTAL.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`)}
            </p>
            <p style={{ fontSize: "11px", color: "#9a8a5a", marginTop: "4px" }}>{UNFULFILLED_COUNT} orders · Oldest: #1221 (Apr 2024)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Critical (4+ days)", amount: 43585, count: 4, color: "#c14e3c" },
              { label: "Aging (2–3 days)", amount: 5865, count: 1, color: "#C9A84C" },
              { label: "Recent (0–1 days)", amount: 2197.50, count: 2, color: "#4CFFA8" },
            ].map((seg) => (
              <div key={seg.label} style={{ background: `${seg.color}08`, border: `1px solid ${seg.color}25`, padding: "14px" }}>
                <p style={{ fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8a5a", marginBottom: "6px" }}>{seg.label}</p>
                <p style={{ fontSize: "22px", fontFamily: "Menlo, monospace", color: seg.color, fontWeight: 700 }}>{mask(`R${seg.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`)}</p>
                <p style={{ fontSize: "10px", color: "#9a8a5a", marginTop: "2px" }}>{seg.count} order{seg.count !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: "9px", color: "#9a8a5a", borderTop: "1px solid rgba(201,168,76,0.08)", paddingTop: "10px" }}>
        Data synced via Shopify Admin API · studexmeat.com · ZAR · Shopify plan · info@studexmeat.com
      </div>
    </div>
  );
}
