import { colors } from "@/lib/theme";
import { formatCurrency } from "@/lib/format";
import { PageHeader, SectionHeading, StatusBadge } from "@/components/war-room";

const DISCORD_SERVER_ID = "";

interface Order {
  id: string;
  customer: string;
  value: number;
  items: number;
  age: string;
  priority: "critical" | "high" | "normal";
}

const ORDERS: Order[] = [
  { id: "#1947", customer: "R.I.", value: 5865, items: 4, age: "2 days", priority: "high" },
  { id: "#1946", customer: "C.G.", value: 1610, items: 4, age: "4 days", priority: "high" },
  { id: "#1945", customer: "C.G.", value: 7245, items: 6, age: "4 days", priority: "high" },
  { id: "#1944", customer: "R.G.", value: 29325, items: 3, age: "4 days", priority: "critical" },
  { id: "#1943", customer: "D.O.", value: 5405, items: 6, age: "4 days", priority: "high" },
];

const PRIORITY_STYLES: Record<Order["priority"], { color: string; glow: boolean }> = {
  critical: { color: "#ff4444", glow: true },
  high: { color: colors.gold, glow: false },
  normal: { color: "#5a5040", glow: false },
};

function PriorityBadge({ priority }: { priority: Order["priority"] }) {
  const { color, glow } = PRIORITY_STYLES[priority];
  return <StatusBadge label={priority} color={color} glow={glow} />;
}

function AgeBadge({ age }: { age: string }) {
  const days = parseInt(age);
  const isOld = days > 3;
  return (
    <span
      style={{
        fontFamily: "'Menlo', monospace",
        fontSize: "9px",
        color: isOld ? "#ff6666" : "#9a8a5a",
        background: isOld ? "rgba(255,102,102,0.08)" : "rgba(154,138,90,0.08)",
        border: `1px solid ${isOld ? "rgba(255,102,102,0.25)" : "rgba(154,138,90,0.15)"}`,
        padding: "2px 6px",
        borderRadius: "2px",
      }}
    >
      {age}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div
      style={{
        background: "#0e0d10",
        border: "1px solid rgba(201,168,76,0.1)",
        borderLeft: `3px solid ${order.priority === "critical" ? "#ff4444" : "#C9A84C"}`,
        padding: "14px 16px",
        marginBottom: "10px",
        boxShadow:
          order.priority === "critical"
            ? "0 0 16px rgba(255,68,68,0.12), 0 4px 16px rgba(0,0,0,0.6)"
            : "0 4px 16px rgba(0,0,0,0.6)",
        transition: "transform 0.15s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span
          style={{
            fontFamily: "'Menlo', monospace",
            fontSize: "13px",
            fontWeight: 700,
            color: "#C9A84C",
            letterSpacing: "1px",
          }}
        >
          {order.id}
        </span>
        <PriorityBadge priority={order.priority} />
      </div>

      {/* Customer */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic",
          fontSize: "15px",
          color: "#f5ecd0",
          marginBottom: "10px",
        }}
      >
        {order.customer}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" as const }}>
        <span
          style={{
            fontFamily: "'Menlo', monospace",
            fontSize: "14px",
            fontWeight: 700,
            color: "#f5ecd0",
          }}
        >
          {formatCurrency(order.value)}
        </span>
        <span
          style={{
            fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
            fontSize: "9px",
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            color: "#7a6a4a",
          }}
        >
          {order.items} items
        </span>
        <AgeBadge age={order.age} />
      </div>
    </div>
  );
}

function KanbanColumn({
  title,
  orders,
  accent,
}: {
  title: string;
  orders: Order[];
  accent: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: "220px",
      }}
    >
      {/* Column header */}
      <div
        style={{
          borderBottom: `2px solid ${accent}`,
          paddingBottom: "10px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "3px",
            textTransform: "uppercase" as const,
            color: accent,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "'Menlo', monospace",
            fontSize: "11px",
            color: accent,
            background: `${accent}18`,
            border: `1px solid ${accent}40`,
            padding: "1px 8px",
            borderRadius: "2px",
          }}
        >
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}

      {orders.length === 0 && (
        <div
          style={{
            border: "1px dashed rgba(201,168,76,0.12)",
            padding: "24px",
            textAlign: "center" as const,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
              fontSize: "9px",
              letterSpacing: "2px",
              color: "#3a3020",
              textTransform: "uppercase" as const,
            }}
          >
            Empty
          </span>
        </div>
      )}
    </div>
  );
}

export default function DeliveryTeam() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <PageHeader
        title="DELIVERY & TEAM"
        subtitle="Order fulfilment · Team chat · WhatsApp notifications"
      />

      {/* ── Section A: Order Fulfilment Board ── */}
      <section style={{ marginBottom: "48px" }}>
        <div style={{ marginBottom: "20px" }}>
          <SectionHeading>ORDER FULFILMENT BOARD</SectionHeading>
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            overflowX: "auto" as const,
          }}
        >
          <KanbanColumn
            title="PAID · UNFULFILLED"
            orders={ORDERS}
            accent="#ff4444"
          />
          <KanbanColumn
            title="IN PREPARATION"
            orders={[]}
            accent="#C9A84C"
          />
          <KanbanColumn
            title="DISPATCHED"
            orders={[]}
            accent="#4CFFA8"
          />
        </div>
      </section>

      {/* ── Sections B & C: Two-column layout ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "24px",
          alignItems: "flex-start",
        }}
      >
        {/* Section B: Team Chat (Discord) */}
        <section>
          <div style={{ marginBottom: "16px" }}>
            <SectionHeading>TEAM CHAT</SectionHeading>
          </div>

          <div
            style={{
              background: "#0e0d10",
              border: "1px solid rgba(201,168,76,0.12)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(201,168,76,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(201,168,76,0.03)",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#5865F2",
                  display: "inline-block",
                  boxShadow: "0 0 6px rgba(88,101,242,0.6)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontSize: "10px",
                  letterSpacing: "3px",
                  textTransform: "uppercase" as const,
                  color: "#C9A84C",
                  fontWeight: 700,
                }}
              >
                DISCORD · STUDEX SERVER
              </span>
            </div>

            {DISCORD_SERVER_ID ? (
              <iframe
                src={`https://discord.com/widget?id=${DISCORD_SERVER_ID}&theme=dark`}
                width="100%"
                height="500"
                style={{ border: "none", borderRadius: "0px", display: "block" }}
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                title="Discord Team Chat"
              />
            ) : (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center" as const,
                  minHeight: "300px",
                  display: "flex",
                  flexDirection: "column" as const,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "32px",
                    color: "#5865F2",
                    opacity: 0.6,
                  }}
                >
                  ◈
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    textTransform: "uppercase" as const,
                    color: "#9a8a5a",
                    margin: 0,
                  }}
                >
                  Connect your Discord server ID to enable team chat
                </p>
                <p
                  style={{
                    fontFamily: "'Menlo', monospace",
                    fontSize: "9px",
                    color: "#5a5040",
                    margin: 0,
                  }}
                >
                  Set DISCORD_SERVER_ID at top of DeliveryTeam.tsx
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section C: WhatsApp Order Notifications */}
        <section>
          <div style={{ marginBottom: "16px" }}>
            <SectionHeading>WHATSAPP NOTIFICATIONS</SectionHeading>
          </div>

          <div
            style={{
              background: "#0e0d10",
              border: "1px solid rgba(201,168,76,0.12)",
              borderTop: "2px solid #25D366",
              padding: "20px",
            }}
          >
            {/* WhatsApp icon + header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "22px" }}>📱</span>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    textTransform: "uppercase" as const,
                    color: "#f5ecd0",
                  }}
                >
                  TWILIO WHATSAPP
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                    fontSize: "9px",
                    letterSpacing: "2px",
                    textTransform: "uppercase" as const,
                    color: "#5a5040",
                  }}
                >
                  Order Notifications
                </div>
              </div>
            </div>

            {/* Number row */}
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontSize: "8px",
                  letterSpacing: "2px",
                  color: "#5a5040",
                  textTransform: "uppercase" as const,
                  marginBottom: "4px",
                }}
              >
                Store WhatsApp Number
              </div>
              <div
                style={{
                  fontFamily: "'Menlo', monospace",
                  fontSize: "13px",
                  color: "#f5ecd0",
                  letterSpacing: "1px",
                }}
              >
                +27 27 949 88737
              </div>
            </div>

            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <div
                style={{
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontSize: "8px",
                  letterSpacing: "2px",
                  color: "#5a5040",
                  textTransform: "uppercase" as const,
                }}
              >
                Status:
              </div>
              <span
                style={{
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase" as const,
                  color: "#C9A84C",
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.35)",
                  padding: "2px 8px",
                  borderRadius: "2px",
                }}
              >
                READY
              </span>
            </div>

            {/* Test button */}
            <button
              disabled
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "rgba(201,168,76,0.5)",
                fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase" as const,
                cursor: "not-allowed",
                marginBottom: "16px",
              }}
            >
              Send Test Message
            </button>

            {/* Note */}
            <div
              style={{
                background: "rgba(201,168,76,0.04)",
                border: "1px solid rgba(201,168,76,0.1)",
                padding: "10px 12px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontSize: "9px",
                  letterSpacing: "1px",
                  color: "#7a6a4a",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Order notifications send automatically on new Shopify orders via Twilio WhatsApp integration.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
