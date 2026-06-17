import { usePrivacy } from "@/contexts/PrivacyContext";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from "recharts";
import { AlertTriangle, CheckCircle, CreditCard, TrendingUp, Users, ShoppingCart } from "lucide-react";

// War Room colors
const GOLD = "#C9A84C";
const GOLD_DIM = "#9a8a5a";
const GOLD_DARK = "#5a4f2e";
const CREAM = "#f5ecd0";
const GREEN = "#6fa84f";
const RED = "#c14e3c";
const OBSIDIAN_2 = "#15140e";
const OBSIDIAN_3 = "#1f1d15";

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 26283 },
  { month: "Feb", revenue: 61333 },
  { month: "Mar", revenue: 248928 },
  { month: "Apr", revenue: 31697 },
  { month: "May", revenue: 5382 },
];

const TOP_POSTS = [
  {
    id: 1,
    title: "Mother of the Nation",
    likes: 3702,
    comments: 287,
    reach: 48200,
    platform: "Instagram",
    date: "2026-05-08",
    campaign: "Mother's Day",
  },
  {
    id: 2,
    title: "Tomahawk Hero — Father's Day",
    likes: 2891,
    comments: 203,
    reach: 36400,
    platform: "Both",
    date: "2026-06-03",
    campaign: "Fathers Day",
  },
  {
    id: 3,
    title: "Wagyu Biltong Unboxing",
    likes: 1847,
    comments: 156,
    reach: 24100,
    platform: "Instagram",
    date: "2026-05-21",
    campaign: "Product Spotlight",
  },
  {
    id: 4,
    title: "Hwende 2x Champion Reveal",
    likes: 1602,
    comments: 189,
    reach: 22800,
    platform: "Both",
    date: "2026-05-14",
    campaign: "Hwende",
  },
  {
    id: 5,
    title: "Heritage Day Braai Tutorial",
    likes: 1394,
    comments: 98,
    reach: 19300,
    platform: "Instagram",
    date: "2026-04-24",
    campaign: "Seasonal",
  },
];

interface UnfulfilledOrder {
  order: string;
  initials: string;
  amount: number;
  daysWaiting: number;
}

interface UnfulfilledData {
  count: number;
  total: number;
  oldest: string;
  orders: UnfulfilledOrder[];
}

function formatCurrency(val: number) {
  return `R${val.toLocaleString("en-ZA")}`;
}

function WRLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase" as const, color: GOLD, fontFamily: "'Helvetica Neue', sans-serif" }}>
      {children}
    </span>
  );
}

function WRCard({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: OBSIDIAN_2,
        border: `1px solid rgba(201,168,76,0.25)`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: OBSIDIAN_2, border: `1px solid ${GOLD}`, padding: "12px 16px" }}>
        <p style={{ fontFamily: "'Menlo', monospace", fontSize: "10px", letterSpacing: "2px", color: GOLD_DIM, textTransform: "uppercase", marginBottom: "4px" }}>{label}</p>
        <p style={{ fontFamily: "'Menlo', monospace", fontSize: "14px", color: GOLD, fontWeight: 600 }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function Analytics() {
  const { isPrivate, mask } = usePrivacy();

  const { data: unfulfilledData } = useQuery<UnfulfilledData>({
    queryKey: ["/api/shopify/unfulfilled"],
  });

  const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const bestMonth = MONTHLY_REVENUE.reduce((a, b) => (a.revenue > b.revenue ? a : b));

  const unfulfilled = unfulfilledData || {
    count: 37,
    total: 125561.15,
    oldest: "#1221 Apr 2024",
    orders: [
      { order: "#1221", initials: "R.G.", amount: 29325, daysWaiting: 420 },
      { order: "#1487", initials: "N.M.", amount: 12450, daysWaiting: 380 },
      { order: "#1592", initials: "T.D.", amount: 8900, daysWaiting: 341 },
      { order: "#1634", initials: "J.V.", amount: 6700, daysWaiting: 298 },
      { order: "#1701", initials: "A.P.", amount: 5200, daysWaiting: 240 },
    ],
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Unfulfilled Pipeline ── */}
      <WRCard
        style={{
          border: `1px solid rgba(193,78,60,0.5)`,
          background: "rgba(193,78,60,0.04)",
        }}
        data-testid="alert-outstanding-orders"
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(193,78,60,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: RED }} />
          <div className="flex-1 min-w-0">
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <p style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: RED, fontFamily: "'Helvetica Neue', sans-serif" }}>
                Unfulfilled Pipeline
              </p>
              <span style={{ fontFamily: "'Menlo', monospace", fontSize: "11px", color: RED, letterSpacing: "1px" }}>
                {mask(String(unfulfilled.count))} orders · {isPrivate ? "••••••" : formatCurrency(unfulfilled.total)} · oldest: {unfulfilled.oldest}
              </span>
            </div>
          </div>
          <button
            style={{
              background: "transparent",
              border: `1px solid rgba(193,78,60,0.5)`,
              color: RED,
              padding: "8px 14px",
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'Helvetica Neue', sans-serif",
              flexShrink: 0,
            }}
          >
            View Shopify
          </button>
        </div>

        {/* Unfulfilled orders table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(193,78,60,0.2)" }}>
                {["Order", "Customer", "Amount", "Days Waiting"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 24px",
                      textAlign: "left",
                      fontSize: "9px",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: GOLD_DIM,
                      fontWeight: 400,
                      fontFamily: "'Helvetica Neue', sans-serif",
                      background: "rgba(0,0,0,0.2)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unfulfilled.orders.map((order, i) => (
                <tr
                  key={order.order}
                  style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}
                  data-testid={`row-unfulfilled-${i}`}
                >
                  <td style={{ padding: "10px 24px", fontFamily: "'Menlo', monospace", fontSize: "11px", color: GOLD, letterSpacing: "1px" }}>
                    {order.order}
                  </td>
                  <td style={{ padding: "10px 24px", fontFamily: "'Menlo', monospace", fontSize: "11px", color: GOLD_DIM }}>
                    {isPrivate ? "•••" : order.initials}
                  </td>
                  <td style={{ padding: "10px 24px", fontFamily: "'Menlo', monospace", fontSize: "12px", color: CREAM, fontWeight: 600 }}>
                    {isPrivate ? "••••••" : formatCurrency(order.amount)}
                  </td>
                  <td style={{ padding: "10px 24px" }}>
                    <span
                      style={{
                        fontFamily: "'Menlo', monospace",
                        fontSize: "11px",
                        color: order.daysWaiting > 300 ? RED : order.daysWaiting > 180 ? "#d8a93a" : GOLD_DIM,
                        letterSpacing: "1px",
                      }}
                    >
                      {mask(String(order.daysWaiting))}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WRCard>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "YTD Revenue",
            value: isPrivate ? "••••••" : formatCurrency(totalRevenue),
            sub: "Jan–May 2026",
            icon: TrendingUp,
            color: GREEN,
          },
          {
            label: "Best Month",
            value: isPrivate ? "••••" : bestMonth.month,
            sub: isPrivate ? "••••••" : formatCurrency(bestMonth.revenue),
            icon: CheckCircle,
            color: GOLD,
          },
          {
            label: "IG Followers",
            value: isPrivate ? "••••••" : "5,318",
            sub: "as of June 2026",
            icon: Users,
            color: GOLD,
          },
          {
            label: "Active Ads",
            value: isPrivate ? "•" : "1",
            sub: "Father's Day Tomahawk",
            icon: ShoppingCart,
            color: "#60a5fa",
          },
        ].map((kpi) => (
          <WRCard
            key={kpi.label}
            style={{ padding: "16px 20px" }}
            data-testid={`kpi-${kpi.label.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <kpi.icon className="w-4 h-4 mb-2" style={{ color: kpi.color }} />
            <p style={{ fontFamily: "'Menlo', 'Monaco', monospace", fontSize: "20px", fontWeight: 700, color: CREAM }}>
              {kpi.value}
            </p>
            <p style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: GOLD, fontFamily: "'Helvetica Neue', sans-serif", marginTop: "4px" }}>
              {kpi.label}
            </p>
            <p style={{ fontSize: "10px", color: GOLD_DIM, marginTop: "2px" }}>{kpi.sub}</p>
          </WRCard>
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      <WRCard style={{ padding: "24px" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "22px", color: CREAM, marginBottom: "4px" }}>
              Revenue by Month
            </p>
            <WRLabel>January – May 2026</WRLabel>
          </div>
          <span style={{ fontFamily: "'Menlo', monospace", fontSize: "14px", fontWeight: 700, color: isPrivate ? GOLD_DIM : GREEN }}>
            {isPrivate ? "••••••" : formatCurrency(totalRevenue)}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.1)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: GOLD_DIM, fontFamily: "'Menlo', monospace", letterSpacing: "2px" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => isPrivate ? "••••" : `R${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: GOLD_DIM, fontFamily: "'Menlo', monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
              {MONTHLY_REVENUE.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.revenue === bestMonth.revenue ? GOLD : "rgba(201,168,76,0.2)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </WRCard>

      {/* ── Top Posts ── */}
      <WRCard style={{ overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "22px", color: CREAM, marginBottom: "4px" }}>
            Top Instagram Posts
          </p>
          <WRLabel>Ranked by total engagement</WRLabel>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
                {["Post", "Campaign", "Likes", "Comments", "Reach", "Platform"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: "9px",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: GOLD_DIM,
                      fontWeight: 400,
                      fontFamily: "'Helvetica Neue', sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_POSTS.map((post, i) => (
                <tr
                  key={post.id}
                  style={{
                    borderBottom: "1px solid rgba(201,168,76,0.08)",
                    background: i === 0 ? "rgba(201,168,76,0.04)" : "transparent",
                  }}
                  data-testid={`row-post-${post.id}`}
                >
                  <td style={{ padding: "12px 20px" }}>
                    <div className="flex items-center gap-2">
                      {i === 0 && <span style={{ color: GOLD, fontSize: "12px" }}>✦</span>}
                      <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "13px", color: CREAM }}>{post.title}</span>
                    </div>
                    <p style={{ fontFamily: "'Menlo', monospace", fontSize: "10px", color: GOLD_DIM, marginTop: "2px", letterSpacing: "1px" }}>
                      {new Date(post.date + "T00:00:00").toLocaleDateString("en-ZA")}
                    </p>
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <span style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: GOLD, border: `1px solid ${GOLD_DARK}`, padding: "3px 8px", fontFamily: "'Helvetica Neue', sans-serif" }}>
                      {post.campaign}
                    </span>
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Menlo', monospace", fontSize: "12px", fontWeight: 600, color: CREAM }}>
                    {isPrivate ? "•••••" : post.likes.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Menlo', monospace", fontSize: "12px", color: GOLD_DIM }}>
                    {isPrivate ? "•••" : post.comments.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Menlo', monospace", fontSize: "12px", color: GOLD_DIM }}>
                    {isPrivate ? "•••••" : post.reach.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Menlo', monospace", fontSize: "10px", color: GOLD_DIM, letterSpacing: "1px" }}>
                    {post.platform.toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WRCard>

      {/* ── Ad Account Status ── */}
      <WRCard style={{ padding: "24px" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "22px", color: CREAM, marginBottom: "4px" }}>
          Ad Account Status
        </p>
        <WRLabel>Meta Business Suite</WRLabel>
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <div style={{ background: "rgba(111,168,79,0.06)", border: `1px solid rgba(111,168,79,0.25)`, padding: "14px 18px" }}>
            <WRLabel>Status</WRLabel>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN, display: "inline-block" }} />
              <span style={{ fontFamily: "'Menlo', monospace", color: GREEN, fontSize: "13px", fontWeight: 600 }}>Active</span>
            </div>
            <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "11px", color: GOLD_DIM, marginTop: "4px" }}>Father's Day Tomahawk</p>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", border: `1px solid rgba(201,168,76,0.15)`, padding: "14px 18px" }}>
            <WRLabel>Daily Budget</WRLabel>
            <p style={{ fontFamily: "'Menlo', monospace", fontSize: "20px", fontWeight: 700, color: CREAM, marginTop: "8px" }}>
              {isPrivate ? "•••••" : "R100"}
            </p>
            <p style={{ fontSize: "10px", color: GOLD_DIM, marginTop: "2px" }}>per day</p>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", border: `1px solid rgba(201,168,76,0.15)`, padding: "14px 18px" }}>
            <WRLabel>Payment</WRLabel>
            <div className="flex items-center gap-2 mt-2">
              <CreditCard className="w-4 h-4" style={{ color: GOLD_DIM }} />
              <span style={{ fontFamily: "'Menlo', monospace", fontSize: "12px", color: CREAM, fontWeight: 600 }}>
                {isPrivate ? "MasterCard ••••" : "MasterCard *8234"}
              </span>
            </div>
            <p style={{ fontSize: "10px", color: GREEN, marginTop: "4px", fontWeight: 500 }}>Billing active</p>
          </div>
        </div>
      </WRCard>
    </div>
  );
}
