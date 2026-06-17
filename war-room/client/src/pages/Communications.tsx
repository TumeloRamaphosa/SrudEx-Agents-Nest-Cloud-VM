import { useState, useEffect } from "react";

interface MockMessage {
  platform: "discord" | "slack";
  channel: string;
  user: string;
  message: string;
  time: string;
}

interface GmailMessage {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
}

const MOCK_MESSAGES: MockMessage[] = [
  {
    platform: "discord",
    channel: "#ops",
    user: "CHARLIE",
    message: "Daily report ready — R0 orders today, pipeline R131,426",
    time: "20:00",
  },
  {
    platform: "discord",
    channel: "#orders",
    user: "CHARLIE",
    message: "⚠️ #1944 R.G. (R29,325) — 4 days PAID unfulfilled",
    time: "20:00",
  },
  {
    platform: "slack",
    channel: "#general",
    user: "System",
    message: "StudEx War Room deployed successfully",
    time: "23:48",
  },
];

function PlatformDot({ platform }: { platform: "discord" | "slack" }) {
  const isDiscord = platform === "discord";
  return (
    <span
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: isDiscord ? "#5865F2" : "#4CFFA8",
        display: "inline-block",
        flexShrink: 0,
        boxShadow: isDiscord
          ? "0 0 6px rgba(88,101,242,0.6)"
          : "0 0 6px rgba(76,255,168,0.5)",
      }}
    />
  );
}

function MessageRow({ msg }: { msg: MockMessage }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "10px 16px",
        borderBottom: "1px solid rgba(201,168,76,0.06)",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "rgba(201,168,76,0.03)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      {/* Platform dot */}
      <div style={{ paddingTop: "3px" }}>
        <PlatformDot platform={msg.platform} />
      </div>

      {/* Channel */}
      <span
        style={{
          fontFamily: "'Menlo', monospace",
          fontSize: "10px",
          color: "#5a5040",
          whiteSpace: "nowrap" as const,
          flexShrink: 0,
          paddingTop: "1px",
          minWidth: "90px",
        }}
      >
        {msg.channel}
      </span>

      {/* User */}
      <span
        style={{
          fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "2px",
          textTransform: "uppercase" as const,
          color: "#C9A84C",
          whiteSpace: "nowrap" as const,
          flexShrink: 0,
          minWidth: "70px",
        }}
      >
        {msg.user}
      </span>

      {/* Message */}
      <span
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "13px",
          color: "#f5ecd0",
          flex: 1,
          lineHeight: 1.4,
        }}
      >
        {msg.message}
      </span>

      {/* Time */}
      <span
        style={{
          fontFamily: "'Menlo', monospace",
          fontSize: "9px",
          color: "#3a3020",
          whiteSpace: "nowrap" as const,
          flexShrink: 0,
        }}
      >
        {msg.time}
      </span>
    </div>
  );
}

function GmailWidget() {
  const [gmailMsgs, setGmailMsgs] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Gmail messages from SQLite cache (synced by Perplexity Computer)
    fetch("/api/messages?source=gmail")
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setGmailMsgs(
            data.map((m) => ({
              id: String(m.id),
              from: m.fromAddr,
              subject: m.subject,
              snippet: m.snippet,
              date: m.date,
              isRead: Boolean(m.isRead),
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const unread = gmailMsgs.filter((m) => !m.isRead).length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
              fontSize: "8px",
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
              color: "#5a5040",
            }}
          >
            GMAIL
          </div>
          {unread > 0 && (
            <span
              style={{
                background: "#c14e3c",
                color: "#fff",
                fontFamily: "'Menlo', monospace",
                fontSize: "9px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "10px",
              }}
            >
              {unread} unread
            </span>
          )}
        </div>
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
            fontSize: "8px",
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
            color: "#C9A84C",
            textDecoration: "none",
            border: "1px solid rgba(201,168,76,0.2)",
            padding: "2px 8px",
            borderRadius: "2px",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,168,76,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          }}
        >
          OPEN →
        </a>
      </div>

      {/* Gmail account badge */}
      <div
        style={{
          background: "#0e0d10",
          border: "1px solid rgba(201,168,76,0.12)",
          borderTop: "2px solid #EA4335",
          padding: "12px 16px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Gmail "G" badge */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#EA4335",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 10px rgba(234,67,53,0.3)",
          }}
        >
          <span style={{ color: "#fff", fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: 700, lineHeight: 1 }}>G</span>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Menlo', monospace",
              fontSize: "11px",
              color: "#f5ecd0",
              letterSpacing: "0.3px",
              marginBottom: "2px",
            }}
          >
            tumelor001@gmail.com
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
            Personal · Tumelo Ramaphosa
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#4CFFA8",
              display: "inline-block",
              boxShadow: "0 0 6px rgba(76,255,168,0.5)",
              animation: "dotPulse 1.8s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
              fontSize: "8px",
              letterSpacing: "2px",
              textTransform: "uppercase" as const,
              color: "#4CFFA8",
            }}
          >
            CONNECTED
          </span>
        </div>
      </div>

      {/* Message list */}
      <div
        style={{
          background: "#0e0d10",
          border: "1px solid rgba(201,168,76,0.12)",
          maxHeight: "280px",
          overflowY: "auto" as const,
        }}
      >
        {loading ? (
          <div style={{ padding: "24px", textAlign: "center" as const }}>
            <span style={{ fontFamily: "'Menlo', monospace", fontSize: "9px", color: "#4a4030", letterSpacing: "2px" }}>
              LOADING GMAIL…
            </span>
          </div>
        ) : gmailMsgs.length === 0 ? (
          <div style={{ padding: "24px 16px" }}>
            <div
              style={{
                fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                fontSize: "9px",
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
                color: "#3a3020",
                marginBottom: "8px",
              }}
            >
              GMAIL PREVIEW
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: "italic",
                fontSize: "12px",
                color: "#7a6a4a",
                lineHeight: 1.6,
              }}
            >
              Connect Gmail to see your inbox here. Daily reports from studex-2571@agentmail.to are forwarded to this address.
            </div>
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "12px",
                padding: "6px 16px",
                border: "1px solid #EA4335",
                color: "#EA4335",
                fontSize: "9px",
                letterSpacing: "2px",
                textDecoration: "none",
                fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                fontWeight: 700,
                textTransform: "uppercase" as const,
              }}
            >
              OPEN GMAIL →
            </a>
          </div>
        ) : (
          gmailMsgs.map((msg, i) => (
            <div
              key={msg.id}
              style={{
                padding: "10px 16px",
                borderBottom: i < gmailMsgs.length - 1 ? "1px solid rgba(201,168,76,0.06)" : "none",
                borderLeft: msg.isRead ? "none" : "2px solid #EA4335",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(201,168,76,0.03)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                <span
                  style={{
                    fontFamily: "'Menlo', monospace",
                    fontSize: "10px",
                    color: msg.isRead ? "#7a6a4a" : "#f5ecd0",
                    fontWeight: msg.isRead ? 400 : 600,
                  }}
                >
                  {msg.from}
                </span>
                <span style={{ fontFamily: "'Menlo', monospace", fontSize: "9px", color: "#3a3020" }}>
                  {msg.date}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "13px",
                  color: msg.isRead ? "#7a6a4a" : "#f5ecd0",
                  fontWeight: msg.isRead ? 400 : 600,
                  marginBottom: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {msg.subject}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "11px",
                  color: "#5a5040",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {msg.snippet}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Store email notice */}
      <div
        style={{
          marginTop: "12px",
          padding: "8px 12px",
          background: "rgba(201,168,76,0.03)",
          border: "1px solid rgba(201,168,76,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
            fontSize: "8px",
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
            color: "#5a5040",
          }}
        >
          STORE EMAIL
        </span>
        <span
          style={{
            fontFamily: "'Menlo', monospace",
            fontSize: "11px",
            color: "#C9A84C",
          }}
        >
          info@studexmeat.com
        </span>
        <a
          href="mailto:info@studexmeat.com"
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
            fontSize: "8px",
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
            color: "#9a8a5a",
            textDecoration: "none",
          }}
        >
          COMPOSE →
        </a>
      </div>
    </div>
  );
}

export default function Communications() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
            fontSize: "36px",
            fontWeight: 700,
            letterSpacing: "8px",
            textTransform: "uppercase" as const,
            color: "#C9A84C",
            margin: 0,
            lineHeight: 1,
          }}
        >
          COMMUNICATIONS HUB
        </h1>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontSize: "12px",
            color: "#9a8a5a",
            marginTop: "6px",
            letterSpacing: "1px",
          }}
        >
          Slack · Discord · Gmail · AgentMail · info@studexmeat.com
        </p>
      </div>

      {/* ── Three-panel layout ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        {/* Left Panel — Slack */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
              fontSize: "8px",
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
              color: "#5a5040",
              marginBottom: "10px",
            }}
          >
            SLACK
          </div>
          <div
            style={{
              background: "#1a1a10",
              padding: "24px",
              border: "1px solid rgba(201,168,76,0.2)",
              borderTop: "2px solid #4CFFA8",
              minHeight: "200px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                color: "#C9A84C",
                letterSpacing: "3px",
                fontSize: "10px",
                margin: "0 0 8px 0",
                textTransform: "uppercase" as const,
              }}
            >
              SLACK WORKSPACE
            </p>
            <p
              style={{
                color: "#9a8a5a",
                fontSize: "12px",
                marginTop: "8px",
                marginBottom: "0",
                lineHeight: 1.5,
              }}
            >
              Connect your Slack workspace to enable team messaging and agent alerts.
            </p>
            <a
              href="https://slack.com/oauth/v2/authorize?client_id=YOUR_CLIENT_ID&scope=channels:read,chat:write"
              style={{
                display: "inline-block",
                marginTop: "16px",
                padding: "8px 16px",
                border: "1px solid #C9A84C",
                color: "#C9A84C",
                fontSize: "10px",
                letterSpacing: "2px",
                textDecoration: "none",
                fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                fontWeight: 700,
                textTransform: "uppercase" as const,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,168,76,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              }}
            >
              CONNECT SLACK →
            </a>
          </div>
        </div>

        {/* Middle Panel — Discord */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
              fontSize: "8px",
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
              color: "#5a5040",
              marginBottom: "10px",
            }}
          >
            DISCORD
          </div>
          <div
            style={{
              background: "#1a1a10",
              padding: "24px",
              border: "1px solid rgba(201,168,76,0.2)",
              borderTop: "2px solid #5865F2",
              minHeight: "200px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                color: "#C9A84C",
                letterSpacing: "3px",
                fontSize: "10px",
                margin: "0 0 8px 0",
                textTransform: "uppercase" as const,
              }}
            >
              DISCORD SERVER
            </p>
            <p
              style={{
                color: "#9a8a5a",
                fontSize: "12px",
                marginTop: "8px",
                marginBottom: "0",
                lineHeight: 1.5,
              }}
            >
              Connect your Discord server to enable team notifications and agent alerts.
            </p>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
              <a
                href="https://discord.gg/your-server"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  border: "1px solid #5865F2",
                  color: "#5865F2",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textDecoration: "none",
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(88,101,242,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                JOIN SERVER →
              </a>
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#9a8a5a",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textDecoration: "none",
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                }}
              >
                CONFIGURE BOT →
              </a>
            </div>
          </div>
        </div>

        {/* Right Panel — Gmail */}
        <div>
          <GmailWidget />
        </div>
      </div>

      {/* ── AgentMail store summary ── */}
      <div
        style={{
          background: "#0e0d10",
          border: "1px solid rgba(201,168,76,0.12)",
          borderTop: "2px solid #9A6FFF",
          padding: "16px 20px",
          marginBottom: "32px",
          display: "flex",
          flexWrap: "wrap" as const,
          gap: "32px",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)", fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase" as const, color: "#5a5040", marginBottom: "4px" }}>
            AGENTMAIL ORG
          </div>
          <div style={{ fontFamily: "'Menlo', monospace", fontSize: "10px", color: "#9A6FFF" }}>
            6e46c2ad-c059-49a2-ba84-e27583348cd5
          </div>
        </div>
        {[
          { label: "CTO LINE", value: "t.rama.studexgroup.cto@agentmail.to", color: "#C9A84C" },
          { label: "B2B OUTREACH", value: "studexgroup@agentmail.to", color: "#4CFFA8" },
          { label: "DAILY BRIEFS", value: "studex-2571@agentmail.to → tumelor001@gmail.com", color: "#9A6FFF" },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)", fontSize: "8px", letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "#5a5040", marginBottom: "4px" }}>
              {item.label}
            </div>
            <div style={{ fontFamily: "'Menlo', monospace", fontSize: "10px", color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Unified Message Log ── */}
      <div>
        <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "4px",
              textTransform: "uppercase" as const,
              color: "#9a8a5a",
              margin: 0,
            }}
          >
            UNIFIED MESSAGE LOG
          </h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#5865F2",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontSize: "8px",
                  letterSpacing: "1.5px",
                  color: "#5a5040",
                  textTransform: "uppercase" as const,
                }}
              >
                Discord
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#4CFFA8",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontSize: "8px",
                  letterSpacing: "1.5px",
                  color: "#5a5040",
                  textTransform: "uppercase" as const,
                }}
              >
                Slack
              </span>
            </span>
          </div>
        </div>

        <div
          style={{
            background: "#0e0d10",
            border: "1px solid rgba(201,168,76,0.12)",
            maxHeight: "400px",
            overflowY: "auto" as const,
          }}
        >
          {/* Log header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "20px 90px 70px 1fr 40px",
              gap: "12px",
              padding: "8px 16px",
              borderBottom: "1px solid rgba(201,168,76,0.1)",
              background: "rgba(201,168,76,0.03)",
            }}
          >
            {["", "CHANNEL", "USER", "MESSAGE", "TIME"].map((col, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontSize: "8px",
                  letterSpacing: "2px",
                  textTransform: "uppercase" as const,
                  color: "#4a4030",
                  fontWeight: 700,
                }}
              >
                {col}
              </span>
            ))}
          </div>

          {MOCK_MESSAGES.map((msg, i) => (
            <MessageRow key={i} msg={msg} />
          ))}

          {MOCK_MESSAGES.length === 0 && (
            <div
              style={{
                padding: "32px",
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
                No messages yet
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
