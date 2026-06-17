import { useEffect, useState } from "react";

interface FbAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
  daily_limit: number;
}

interface FbCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
}

interface FbAdset {
  id: string;
  name: string;
  status: string;
  daily_budget: number;
  targeting: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface FbAd {
  id: string;
  name: string;
  status: string;
  creative_type: string;
  impressions: number;
  clicks: number;
  spend: number;
}

interface FbBilling {
  method: string;
  status: string;
  balance: string;
  daily_limit: string;
}

interface FbAdsData {
  account: FbAccount;
  campaigns: FbCampaign[];
  adsets: FbAdset[];
  ads: FbAd[];
  billing: FbBilling;
}

const rajdhani = "var(--font-rajdhani, 'Rajdhani', sans-serif)";
const serif = "'Cormorant Garamond', Georgia, serif";
const mono = "var(--font-mono, 'Menlo', monospace)";

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      style={{
        fontFamily: rajdhani,
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "2px",
        textTransform: "uppercase" as const,
        color: isActive ? "#4CFFA8" : "#9a8a5a",
        background: isActive ? "rgba(76,255,168,0.08)" : "rgba(154,138,90,0.08)",
        border: `1px solid ${isActive ? "rgba(76,255,168,0.3)" : "rgba(154,138,90,0.2)"}`,
        padding: "2px 8px",
        borderRadius: "2px",
        boxShadow: isActive ? "0 0 8px rgba(76,255,168,0.15)" : "none",
      }}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "#0e0d10",
        border: "1px solid rgba(201,168,76,0.08)",
        borderTop: "2px solid #C9A84C",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.8), 0 2px 8px rgba(201,168,76,0.1), inset 0 1px 0 rgba(201,168,76,0.08)",
        padding: "20px",
        flex: 1,
        minWidth: "150px",
      }}
    >
      <div
        style={{
          fontFamily: rajdhani,
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "3px",
          textTransform: "uppercase" as const,
          color: "#9a8a5a",
          marginBottom: "10px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: "28px",
          color: "#C9A84C",
          fontWeight: 700,
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: rajdhani,
            fontSize: "8px",
            letterSpacing: "2px",
            color: "#3a3a28",
            textTransform: "uppercase" as const,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "16px",
        marginTop: "36px",
      }}
    >
      <h2
        style={{
          fontFamily: rajdhani,
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "4px",
          textTransform: "uppercase" as const,
          color: "#C9A84C",
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "rgba(201,168,76,0.12)",
        }}
      />
    </div>
  );
}

function MetricPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: "2px" }}>
      <span
        style={{
          fontFamily: rajdhani,
          fontSize: "8px",
          letterSpacing: "2px",
          textTransform: "uppercase" as const,
          color: "#5a5040",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: mono,
          fontSize: "13px",
          color: "#f5ecd0",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function FacebookAds() {
  const [data, setData] = useState<FbAdsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/facebook/ads")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
          fontFamily: rajdhani,
          fontSize: "11px",
          letterSpacing: "3px",
          color: "#9a8a5a",
          textTransform: "uppercase" as const,
        }}
      >
        Loading · Meta Business Suite...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
          fontFamily: rajdhani,
          fontSize: "11px",
          letterSpacing: "3px",
          color: "#c14e3c",
          textTransform: "uppercase" as const,
        }}
      >
        Failed to load ads data
      </div>
    );
  }

  const totalSpend = data.campaigns.reduce((s, c) => s + c.spend, 0);
  const activeCampaigns = data.campaigns.filter((c) => c.status === "ACTIVE").length;
  const totalImpressions = data.campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = data.campaigns.reduce((s, c) => s + c.clicks, 0);
  const avgCtr =
    totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%"
      : "0.00%";

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontFamily: rajdhani,
            fontSize: "36px",
            fontWeight: 700,
            letterSpacing: "8px",
            textTransform: "uppercase" as const,
            color: "#C9A84C",
            margin: 0,
            lineHeight: 1,
          }}
        >
          FACEBOOK ADS
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: "12px",
            color: "#9a8a5a",
            marginTop: "6px",
            letterSpacing: "1px",
          }}
        >
          Meta Business Suite · Campaign Manager
        </p>
        <div
          style={{
            marginTop: "8px",
            fontFamily: rajdhani,
            fontSize: "9px",
            letterSpacing: "2px",
            color: "#4a4038",
            textTransform: "uppercase" as const,
          }}
        >
          Account: {data.account.name} · {data.account.id} · {data.account.currency}
        </div>
      </div>

      {/* Top stat row */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap" as const,
          marginBottom: "8px",
        }}
      >
        <StatCard
          label="Total Spend Today"
          value={`R${totalSpend.toLocaleString()}`}
          sub="Live data pending"
        />
        <StatCard
          label="Active Campaigns"
          value={String(activeCampaigns)}
          sub="Live data pending"
        />
        <StatCard
          label="Total Impressions"
          value={totalImpressions.toLocaleString()}
          sub="Live data pending"
        />
        <StatCard
          label="Click-Through Rate"
          value={avgCtr}
          sub="Live data pending"
        />
      </div>

      {/* Campaigns section */}
      <SectionHeader title="Campaigns" />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
        {data.campaigns.map((c) => (
          <div
            key={c.id}
            style={{
              background: "#0e0d10",
              border: "1px solid rgba(201,168,76,0.08)",
              borderTop: "2px solid rgba(201,168,76,0.3)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.05)",
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "17px",
                    color: "#f5ecd0",
                    marginBottom: "4px",
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontFamily: rajdhani,
                    fontSize: "8px",
                    letterSpacing: "2px",
                    color: "#4a4038",
                    textTransform: "uppercase" as const,
                  }}
                >
                  ID: {c.id} · {c.objective.replace("OUTCOME_", "")}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" as const }}>
              <MetricPill label="Spend" value={`R${c.spend.toLocaleString()}`} />
              <MetricPill label="Impressions" value={c.impressions.toLocaleString()} />
              <MetricPill label="Clicks" value={c.clicks.toLocaleString()} />
              <MetricPill label="Reach" value={c.reach.toLocaleString()} />
            </div>
          </div>
        ))}
      </div>

      {/* Ad Sets section */}
      <SectionHeader title="Ad Sets" />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
        {data.adsets.map((a) => (
          <div
            key={a.id}
            style={{
              background: "#0e0d10",
              border: "1px solid rgba(201,168,76,0.08)",
              borderTop: "2px solid rgba(201,168,76,0.2)",
              boxShadow:
                "0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.05)",
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "17px",
                    color: "#f5ecd0",
                    marginBottom: "4px",
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontFamily: rajdhani,
                    fontSize: "8px",
                    letterSpacing: "2px",
                    color: "#4a4038",
                    textTransform: "uppercase" as const,
                    marginBottom: "4px",
                  }}
                >
                  {a.targeting}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: "11px",
                    color: "#C9A84C",
                  }}
                >
                  R{(a.daily_budget / 100).toFixed(0)}/day
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" as const }}>
              <MetricPill label="Impressions" value={a.impressions.toLocaleString()} />
              <MetricPill label="Clicks" value={a.clicks.toLocaleString()} />
              <MetricPill label="CTR" value={`${a.ctr}%`} />
            </div>
          </div>
        ))}
      </div>

      {/* Active Ads section */}
      <SectionHeader title="Active Ads" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {data.ads.map((ad) => (
          <div
            key={ad.id}
            style={{
              background: "#0e0d10",
              border: "1px solid rgba(201,168,76,0.08)",
              borderTop: "2px solid rgba(76,255,168,0.3)",
              boxShadow:
                "0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(76,255,168,0.04)",
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "16px",
                    color: "#f5ecd0",
                    marginBottom: "4px",
                  }}
                >
                  {ad.name}
                </div>
                <div
                  style={{
                    fontFamily: rajdhani,
                    fontSize: "8px",
                    letterSpacing: "2px",
                    color: "#4a4038",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {ad.creative_type}
                </div>
              </div>
              <StatusBadge status={ad.status} />
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" as const }}>
              <MetricPill label="Impressions" value={ad.impressions.toLocaleString()} />
              <MetricPill label="Clicks" value={ad.clicks.toLocaleString()} />
              <MetricPill label="Spend" value={`R${ad.spend}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Billing section */}
      <SectionHeader title="Billing" />
      <div
        style={{
          background: "#0e0d10",
          border: "1px solid rgba(201,168,76,0.08)",
          borderTop: "2px solid #C9A84C",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.8), 0 2px 8px rgba(201,168,76,0.1), inset 0 1px 0 rgba(201,168,76,0.08)",
          padding: "20px",
          display: "flex",
          gap: "40px",
          flexWrap: "wrap" as const,
          marginBottom: "8px",
        }}
      >
        <MetricPill label="Payment Method" value={data.billing.method} />
        <MetricPill label="Status" value={data.billing.status} />
        <MetricPill label="Balance" value={data.billing.balance} />
        <MetricPill label="Daily Limit" value={data.billing.daily_limit} />
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(201,168,76,0.08)",
          fontFamily: rajdhani,
          fontSize: "9px",
          letterSpacing: "2px",
          color: "#3a3028",
          textTransform: "uppercase" as const,
        }}
      >
        ⚡ Real-time data via Meta Marketing API · Connect your User Token to enable live sync
      </div>
    </div>
  );
}
