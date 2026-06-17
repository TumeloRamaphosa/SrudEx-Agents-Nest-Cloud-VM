import { useMemo, useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  codename: string;
  status: "online" | "idle" | "offline";
  platform: string;
  capabilities: string[];
  color: string;
  icon: string;
}

const AGENTS: Agent[] = [
  {
    id: "perplexity-computer",
    name: "Perplexity Computer",
    role: "Orchestrator",
    codename: "CHARLIE",
    status: "online",
    platform: "Perplexity AI",
    capabilities: ["Scheduling", "Shopify", "Reporting", "Coordination"],
    color: "#C9A84C",
    icon: "⬡",
  },
  {
    id: "mini-max-1",
    name: "Mini Max Agent 1",
    role: "Content Generator",
    codename: "APEX",
    status: "online",
    platform: "MiniMax",
    capabilities: ["Image Gen", "Video Gen", "Captions"],
    color: "#4CFFA8",
    icon: "◈",
  },
  {
    id: "mini-max-2",
    name: "Mini Max Agent 2",
    role: "Analytics Engine",
    codename: "NOVA",
    status: "online",
    platform: "MiniMax",
    capabilities: ["Analytics", "Reporting", "Insights"],
    color: "#4CFFA8",
    icon: "◈",
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    role: "Memory & Identity",
    codename: "KILO",
    status: "idle",
    platform: "KiloCode / Claude",
    capabilities: ["Workspace Memory", "Identity", "Context"],
    color: "#C9A84C",
    icon: "◉",
  },
  {
    id: "hermes",
    name: "Hermes Agent",
    role: "Command Center",
    codename: "HERMES",
    status: "idle",
    platform: "Hermes Workspace",
    capabilities: ["Multi-model Chat", "Terminal", "Skills"],
    color: "#C9A84C",
    icon: "⟁",
  },
  {
    id: "cursor",
    name: "Cursor Agent",
    role: "Code Builder",
    codename: "CURSOR",
    status: "idle",
    platform: "Cursor AI",
    capabilities: ["Code Generation", "Debugging", "Refactoring"],
    color: "#C9A84C",
    icon: "▸",
  },
  {
    id: "anti-gravity",
    name: "AntiGravity",
    role: "Store Designer",
    codename: "GRAV",
    status: "idle",
    platform: "AntiGravity",
    capabilities: ["Shopify Theme", "UI Design", "Store UX"],
    color: "#C9A84C",
    icon: "⟠",
  },
  {
    id: "cashclaw",
    name: "CashClaw",
    role: "Agent Economy Layer",
    codename: "CASH",
    status: "idle",
    platform: "HYRVE AI Marketplace",
    capabilities: ["Missions", "Invoicing", "Stripe", "Lead Gen"],
    color: "#C9A84C",
    icon: "◎",
  },
  {
    id: "denchclaw",
    name: "DenchClaw",
    role: "CRM Agent",
    codename: "DENCH",
    status: "idle",
    platform: "DenchClaw / OpenClaw",
    capabilities: ["CRM", "Contacts", "Email", "Pipeline"],
    color: "#C9A84C",
    icon: "◑",
  },
  {
    id: "mac-mini",
    name: "Mac Mini M4",
    role: "Local Agent Host",
    codename: "NEXUS",
    status: "online",
    platform: "Mac Mini M4 + Ollama",
    capabilities: ["Hermes Gateway", "Claude Code", "Ollama LLMs", "Terminal"],
    color: "#4CFFA8",
    icon: "⬛",
  },
];

// Real AgentMail inboxes — live from agentmail.to
const REAL_AGENTMAIL_INBOXES = [
  {
    email: "t.rama.studexgroup.cto@agentmail.to",
    displayName: "Tumelo Ramaphosa — StudEx Group CTO",
    assigned: "CHARLIE",
    role: "CTO direct line / escalations",
    tag: "PERSONAL",
    tagColor: "#C9A84C",
  },
  {
    email: "studexgroup@agentmail.to",
    displayName: "StudEx Group",
    assigned: "CHARLIE",
    role: "B2B outreach & partner comms",
    tag: "B2B",
    tagColor: "#4CFFA8",
  },
  {
    email: "studex-2571@agentmail.to",
    displayName: "StudEx-2571",
    assigned: "CHARLIE",
    role: "Daily briefs → tumelor001@gmail.com",
    tag: "REPORTS",
    tagColor: "#9A6FFF",
  },
];

const AGENT_CODENAMES = ["CHARLIE", "APEX", "NOVA", "KILO", "HERMES", "CURSOR", "GRAV", "CASH", "DENCH", "NEXUS", "Unassigned"];

const onlineCount = AGENTS.filter((a) => a.status === "online").length;
const idleCount = AGENTS.filter((a) => a.status === "idle").length;
const offlineCount = AGENTS.filter((a) => a.status === "offline").length;

interface AgentMailMessage {
  id: string;
  inbox: string;
  from: string;
  subject: string;
  date: string;
  isRead: boolean;
  snippet: string;
}

function StatusBadge({ status }: { status: Agent["status"] }) {
  if (status === "online") {
    return (
      <span
        style={{
          fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "2px",
          textTransform: "uppercase" as const,
          color: "#4CFFA8",
          background: "rgba(76,255,168,0.08)",
          border: "1px solid rgba(76,255,168,0.3)",
          padding: "2px 8px",
          borderRadius: "2px",
          boxShadow: "0 0 8px rgba(76,255,168,0.2)",
        }}
      >
        ONLINE
      </span>
    );
  }
  if (status === "idle") {
    return (
      <span
        style={{
          fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "2px",
          textTransform: "uppercase" as const,
          color: "#C9A84C",
          background: "rgba(201,168,76,0.08)",
          border: "1px solid rgba(201,168,76,0.3)",
          padding: "2px 8px",
          borderRadius: "2px",
        }}
      >
        IDLE
      </span>
    );
  }
  return (
    <span
      style={{
        fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "2px",
        textTransform: "uppercase" as const,
        color: "#4a4a4a",
        background: "rgba(74,74,74,0.08)",
        border: "1px solid rgba(74,74,74,0.3)",
        padding: "2px 8px",
        borderRadius: "2px",
      }}
    >
      OFFLINE
    </span>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const isOnline = agent.status === "online";

  return (
    <div
      style={{
        background: "#0e0d10",
        borderTop: `2px solid ${agent.color}`,
        borderLeft: "1px solid rgba(201,168,76,0.08)",
        borderRight: "1px solid rgba(201,168,76,0.08)",
        borderBottom: "1px solid rgba(201,168,76,0.08)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.8), 0 2px 8px rgba(201,168,76,0.1), inset 0 1px 0 rgba(201,168,76,0.08)",
        padding: "20px",
        position: "relative" as const,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
        transform: "perspective(800px) rotateX(1deg)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "perspective(800px) rotateX(0deg) translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.9), 0 4px 16px rgba(201,168,76,0.2), inset 0 1px 0 rgba(201,168,76,0.12)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "perspective(800px) rotateX(1deg)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px rgba(0,0,0,0.8), 0 2px 8px rgba(201,168,76,0.1), inset 0 1px 0 rgba(201,168,76,0.08)";
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "28px",
              fontFamily: "monospace",
              color: agent.color,
              lineHeight: 1,
              filter: isOnline
                ? `drop-shadow(0 0 6px ${agent.color}88)`
                : "none",
              animation: isOnline ? "dotPulse 2s ease-in-out infinite" : "none",
            }}
          >
            {agent.icon}
          </span>
          <span
            style={{
              fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "4px",
              textTransform: "uppercase" as const,
              color: "#6a6050",
            }}
          >
            {agent.codename}
          </span>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Agent name */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic",
          fontSize: "20px",
          color: "#f5ecd0",
          marginBottom: "4px",
          lineHeight: 1.2,
        }}
      >
        {agent.name}
      </div>

      {/* Role */}
      <div
        style={{
          fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "3px",
          textTransform: "uppercase" as const,
          color: "#9a8a5a",
          marginBottom: "2px",
        }}
      >
        {agent.role}
      </div>

      {/* Platform */}
      <div
        style={{
          fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
          fontSize: "9px",
          letterSpacing: "2px",
          textTransform: "uppercase" as const,
          color: "#5a5040",
          marginBottom: "16px",
        }}
      >
        {agent.platform}
      </div>

      {/* Capabilities */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap" as const,
          gap: "6px",
          marginBottom: "16px",
        }}
      >
        {agent.capabilities.map((cap) => (
          <span
            key={cap}
            style={{
              background: "#1a1a10",
              border: `1px solid rgba(201,168,76,0.2)`,
              color: "#9a8a5a",
              fontSize: "8px",
              letterSpacing: "1.5px",
              textTransform: "uppercase" as const,
              fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "2px",
            }}
          >
            {cap}
          </span>
        ))}
      </div>

      {/* Status indicator dot */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: isOnline ? "#4CFFA8" : agent.status === "idle" ? "#C9A84C" : "#4a4a4a",
            display: "inline-block",
            animation: isOnline ? "dotPulse 1.8s ease-in-out infinite" : "none",
            boxShadow: isOnline ? "0 0 8px rgba(76,255,168,0.6)" : "none",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
            fontSize: "8px",
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
            color: isOnline ? "#4CFFA8" : "#5a5040",
          }}
        >
          {isOnline ? "Signal Active" : "Standby"}
        </span>
      </div>
    </div>
  );
}

function AgentMailSection() {
  const [assignments, setAssignments] = useState<Record<string, string>>(
    Object.fromEntries(REAL_AGENTMAIL_INBOXES.map((inbox) => [inbox.email, inbox.assigned]))
  );
  const [messages, setMessages] = useState<AgentMailMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [selectedInbox, setSelectedInbox] = useState<string | null>(null);

  useEffect(() => {
    // Fetch AgentMail messages from SQLite cache (synced by Perplexity Computer)
    fetch("/api/messages?source=agentmail")
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setMessages(
            data.map((m) => ({
              id: m.messageId,
              inbox: m.inbox,
              from: m.fromAddr,
              subject: m.subject,
              date: m.date,
              isRead: Boolean(m.isRead),
              snippet: m.snippet,
            }))
          );
        }
        setLoadingMsgs(false);
      })
      .catch(() => setLoadingMsgs(false));
  }, []);

  const filteredMessages = selectedInbox
    ? messages.filter((m) => m.inbox === selectedInbox)
    : messages;

  return (
    <div style={{ marginTop: "56px" }}>
      {/* Section header */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "6px",
            textTransform: "uppercase" as const,
            color: "#C9A84C",
            margin: 0,
            lineHeight: 1,
          }}
        >
          AGENTMAIL — LIVE INBOXES
        </h2>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontSize: "11px",
            color: "#9a8a5a",
            marginTop: "6px",
            letterSpacing: "1px",
          }}
        >
          agentmail.to · 3 active inboxes · org: 6e46c2ad-c059-49a2-ba84-e27583348cd5
        </p>
      </div>

      {/* Inbox cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {REAL_AGENTMAIL_INBOXES.map((inbox) => {
          const inboxMsgs = messages.filter((m) => m.inbox === inbox.email);
          const unread = inboxMsgs.filter((m) => !m.isRead).length;
          const isSelected = selectedInbox === inbox.email;
          return (
            <div
              key={inbox.email}
              onClick={() => setSelectedInbox(isSelected ? null : inbox.email)}
              style={{
                background: isSelected ? "rgba(201,168,76,0.06)" : "#0e0d10",
                border: isSelected
                  ? `1px solid rgba(201,168,76,0.4)`
                  : "1px solid rgba(201,168,76,0.12)",
                borderTop: `2px solid ${inbox.tagColor}`,
                padding: "16px 20px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(201,168,76,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#0e0d10";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase" as const,
                    color: inbox.tagColor,
                    background: `${inbox.tagColor}14`,
                    border: `1px solid ${inbox.tagColor}40`,
                    padding: "2px 8px",
                    borderRadius: "2px",
                  }}
                >
                  {inbox.tag}
                </span>
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
                      minWidth: "18px",
                      textAlign: "center" as const,
                    }}
                  >
                    {unread}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "'Menlo', 'Courier New', monospace",
                  fontSize: "11px",
                  color: "#f5ecd0",
                  letterSpacing: "0.3px",
                  marginBottom: "4px",
                  wordBreak: "break-all" as const,
                }}
              >
                {inbox.email}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "12px",
                  color: "#9a8a5a",
                  marginBottom: "8px",
                }}
              >
                {inbox.displayName}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                  fontSize: "9px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase" as const,
                  color: "#5a5040",
                  marginBottom: "10px",
                }}
              >
                {inbox.role}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <select
                  value={assignments[inbox.email]}
                  onChange={(e) => {
                    e.stopPropagation();
                    setAssignments((prev) => ({ ...prev, [inbox.email]: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#1a1a10",
                    border: "1px solid rgba(201,168,76,0.2)",
                    color: "#C9A84C",
                    fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                    fontSize: "9px",
                    letterSpacing: "2px",
                    textTransform: "uppercase" as const,
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: "2px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {AGENT_CODENAMES.map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <span
                  style={{
                    fontFamily: "'Menlo', monospace",
                    fontSize: "9px",
                    color: "#5a5040",
                  }}
                >
                  {loadingMsgs ? "…" : `${inboxMsgs.length} msgs`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live message feed */}
      <div>
        <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
          <h3
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
            {selectedInbox ? `MESSAGES — ${selectedInbox.split("@")[0].toUpperCase()}` : "ALL MESSAGES"}
          </h3>
          {selectedInbox && (
            <button
              onClick={() => setSelectedInbox(null)}
              style={{
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "#6a6050",
                fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                fontSize: "8px",
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
                padding: "2px 8px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              CLEAR FILTER ×
            </button>
          )}
        </div>
        <div
          style={{
            background: "#0e0d10",
            border: "1px solid rgba(201,168,76,0.12)",
            maxHeight: "400px",
            overflowY: "auto" as const,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 2fr 80px",
              padding: "8px 16px",
              borderBottom: "1px solid rgba(201,168,76,0.1)",
              background: "rgba(201,168,76,0.03)",
            }}
          >
            {["FROM", "INBOX", "SUBJECT", "DATE"].map((col) => (
              <span
                key={col}
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

          {loadingMsgs ? (
            <div style={{ padding: "24px", textAlign: "center" as const }}>
              <span style={{ fontFamily: "'Menlo', monospace", fontSize: "9px", color: "#4a4030", letterSpacing: "2px" }}>
                FETCHING MESSAGES…
              </span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center" as const }}>
              <span style={{ fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)", fontSize: "9px", letterSpacing: "2px", color: "#3a3020", textTransform: "uppercase" as const }}>
                No messages found
              </span>
            </div>
          ) : (
            filteredMessages.map((msg, i) => (
              <div
                key={msg.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 2fr 80px",
                  padding: "10px 16px",
                  borderBottom: i < filteredMessages.length - 1 ? "1px solid rgba(201,168,76,0.05)" : "none",
                  borderLeft: msg.isRead ? "none" : "2px solid #C9A84C",
                  alignItems: "center",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(201,168,76,0.03)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <span style={{ fontFamily: "'Menlo', monospace", fontSize: "10px", color: msg.isRead ? "#7a6a4a" : "#f5ecd0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                  {msg.from}
                </span>
                <span style={{ fontFamily: "'Menlo', monospace", fontSize: "9px", color: "#5a5040", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                  {msg.inbox.split("@")[0]}
                </span>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", color: msg.isRead ? "#7a6a4a" : "#f5ecd0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, fontWeight: msg.isRead ? 400 : 600 }}>
                  {msg.subject}
                </span>
                <span style={{ fontFamily: "'Menlo', monospace", fontSize: "9px", color: "#3a3020", whiteSpace: "nowrap" as const }}>
                  {msg.date}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgentNetwork() {
  const stars = useMemo(
    () =>
      Array.from({ length: 150 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        duration: Math.random() * 8 + 4,
      })),
    []
  );

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Starfield layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {stars.map((star) => (
          <span
            key={star.id}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: "50%",
              background: "white",
              opacity: star.opacity,
              animation: `starDrift ${star.duration}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* OS Status strip */}
        <div
          style={{
            borderBottom: "1px solid rgba(201,168,76,0.12)",
            padding: "8px 0",
            marginBottom: "32px",
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "0",
            alignItems: "center",
          }}
        >
          {[
            "STUDEX OS · ONLINE",
            `${AGENTS.length} AGENTS REGISTERED`,
            `${onlineCount} ONLINE`,
            `${idleCount} IDLE`,
            `${offlineCount} OFFLINE`,
            "AGENTMAIL · 3 INBOXES LIVE",
            "UPTIME: 99.9%",
          ].map((item, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-mono, 'Menlo', monospace)",
                fontSize: "8px",
                letterSpacing: "2px",
                color: i === 0 ? "#C9A84C" : i === 5 ? "#4CFFA8" : "#5a5040",
                padding: "0 16px",
                borderRight: i < 6 ? "1px solid rgba(201,168,76,0.1)" : "none",
              }}
            >
              {item}
            </span>
          ))}
        </div>

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
            AGENT NETWORK
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
            StudEx OS · {AGENTS.length} Active Agents · AgentMail Live · Space Factory Array
          </p>
        </div>

        {/* Agent grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {/* AgentMail Inbox Assignment + Live Messages */}
        <AgentMailSection />
      </div>
    </div>
  );
}
