import { useState } from "react";
import { Cpu, Globe, Building2, Users, TrendingUp, CheckCircle, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";

const TIERS = [
  {
    name: "Meat OS",
    subtitle: "Single Brand",
    price: "R8,500",
    period: "/mo",
    color: "#a68a2e",
    target: "Independent butcheries, small food brands",
    agents: 4,
    features: [
      "CHARLIE (Orchestrator)",
      "APEX (Content)",
      "NOVA (Analytics)",
      "NEXUS (Local agent)",
      "Shopify integration",
      "Daily automated reports",
      "Social media scheduling",
      "WhatsApp order alerts",
    ],
  },
  {
    name: "Agency OS",
    subtitle: "Multi-Brand",
    price: "R18,500",
    period: "/mo",
    color: "#2d8a3e",
    target: "Marketing agencies, multi-store operators",
    agents: 8,
    features: [
      "All Meat OS features",
      "KILO (OpenClaw agent)",
      "HERMES (Command center)",
      "CURSOR (Dev agent)",
      "CashClaw invoicing",
      "DenchClaw CRM",
      "5 brand dashboards",
      "AgentMail (10 inboxes)",
      "FeedHive publishing",
    ],
    highlight: true,
  },
  {
    name: "Marketplace OS",
    subtitle: "Full Ecosystem",
    price: "R24,000",
    period: "/mo",
    color: "#c4a330",
    target: "Enterprise, export platforms, B2B networks",
    agents: 11,
    features: [
      "All Agency OS features",
      "CASH (HYRVE marketplace)",
      "DENCH (CRM agent)",
      "GRAV (AntiGravity store)",
      "Global Markets platform",
      "ElevenLabs voice agents",
      "Google Ads automation",
      "Facebook Ads automation",
      "Custom MCP integrations",
      "White-label War Room",
    ],
  },
];

const METRICS = [
  { label: "Target MRR @ 20 clients", value: "R240K", period: "12-month projection", color: "#a68a2e" },
  { label: "Avg. hours saved/client", value: "40h", period: "per month", color: "#2d8a3e" },
  { label: "ROI vs. hiring staff", value: "6.2×", period: "cost efficiency", color: "#c4a330" },
  { label: "Pilot clients", value: "0 → 3", period: "Q3 2026 target", color: "#7a6e52" },
];

const PIPELINE = [
  { stage: "Lead", count: 0, color: "#7a6e52" },
  { stage: "Demo", count: 0, color: "#a68a2e" },
  { stage: "Trial", count: 0, color: "#2d8a3e" },
  { stage: "Signed", count: 0, color: "#c4a330" },
];

const ROADMAP = [
  { phase: "Phase 1", label: "Internal MVP", date: "Jun 2026", status: "live", items: ["War Room built", "Shopify live", "Cron reports running", "11 agents wired"] },
  { phase: "Phase 2", label: "First Pilot", date: "Q3 2026", status: "building", items: ["Mac Mini NEXUS", "Cloudflare tunnel", "White-label dashboard", "1st paying client"] },
  { phase: "Phase 3", label: "Scale to 5", date: "Q4 2026", status: "planned", items: ["SaaS billing via CashClaw", "Self-serve onboarding", "Agency OS tier live", "R90K MRR target"] },
  { phase: "Phase 4", label: "20 Clients", date: "2027", status: "planned", items: ["Marketplace OS live", "Global Markets B2B", "R240K MRR target", "Series A readiness"] },
];

export default function SuperAgents() {
  const [view, setView] = useState<"pricing" | "pipeline" | "roadmap">("pricing");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-4 h-4" style={{ color: "#a68a2e" }} />
          <span style={{ fontSize: "9px", letterSpacing: "5px", textTransform: "uppercase", color: "#7a6e52", fontFamily: "'Helvetica Neue', sans-serif" }}>
            SUPER AGENTS — SAAS PLATFORM
          </span>
        </div>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "28px",
            fontWeight: 300,
            color: "#1a1710",
            lineHeight: 1.15,
          }}
        >
          AI Operating Systems for Premium Brands
        </h2>
        <p style={{ fontSize: "11px", color: "#7a6e52", marginTop: "4px" }}>
          White-label the StudEx War Room — sell autonomous agent infrastructure to food brands, retailers, and agencies.
        </p>
      </div>

      {/* KPI metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METRICS.map((m) => (
          <div
            key={m.label}
            style={{
              background: "rgba(166,138,46,0.04)",
              border: "1px solid rgba(166,138,46,0.10)",
              padding: "14px",
            }}
          >
            <p style={{ fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#7a6e52", marginBottom: "6px" }}>{m.label}</p>
            <p style={{ fontSize: "24px", fontFamily: "Menlo, monospace", color: m.color, fontWeight: 700 }}>{m.value}</p>
            <p style={{ fontSize: "9px", color: "#7a6e52", marginTop: "2px" }}>{m.period}</p>
          </div>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-1">
        {[
          { id: "pricing", label: "Pricing Tiers" },
          { id: "pipeline", label: "Client Pipeline" },
          { id: "roadmap", label: "Roadmap" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id as any)}
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "'Helvetica Neue', sans-serif",
              padding: "6px 14px",
              background: view === v.id ? "rgba(166,138,46,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${view === v.id ? "rgba(166,138,46,0.30)" : "rgba(166,138,46,0.10)"}`,
              color: view === v.id ? "#a68a2e" : "#7a6e52",
              cursor: "pointer",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* PRICING */}
      {view === "pricing" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: tier.highlight ? "rgba(76,255,168,0.05)" : "rgba(201,168,76,0.03)",
                border: `1px solid ${tier.highlight ? "rgba(76,255,168,0.25)" : "rgba(166,138,46,0.10)"}`,
                padding: "20px",
                position: "relative",
              }}
            >
              {tier.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: "-1px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#2d8a3e",
                    color: "#ffffff",
                    fontSize: "7px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    padding: "3px 12px",
                    fontWeight: 700,
                  }}
                >
                  RECOMMENDED
                </div>
              )}
              <div className="mb-4 mt-2">
                <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: tier.color, marginBottom: "2px" }}>{tier.subtitle}</p>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "#1a1710" }}>{tier.name}</p>
                <p style={{ fontSize: "10px", color: "#7a6e52", marginTop: "4px" }}>{tier.target}</p>
              </div>

              <div className="flex items-end gap-1 mb-4">
                <span style={{ fontSize: "32px", fontFamily: "Menlo, monospace", color: tier.color, fontWeight: 700 }}>{tier.price}</span>
                <span style={{ fontSize: "11px", color: "#7a6e52", paddingBottom: "6px" }}>{tier.period}</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-3 h-3" style={{ color: tier.color }} />
                <span style={{ fontSize: "10px", color: "#7a6e52" }}>{tier.agents} AI Agents included</span>
              </div>

              <div className="space-y-2">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 shrink-0" style={{ color: tier.color }} />
                    <span style={{ fontSize: "11px", color: "#7a6e52" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PIPELINE */}
      {view === "pipeline" && (
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {PIPELINE.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <div
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    border: `1px solid ${stage.color}30`,
                    padding: "16px 20px",
                    minWidth: "120px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#7a6e52", marginBottom: "6px" }}>{stage.stage}</p>
                  <p style={{ fontSize: "28px", fontFamily: "Menlo, monospace", color: stage.color, fontWeight: 700 }}>{stage.count}</p>
                </div>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight className="w-4 h-4" style={{ color: "rgba(166,138,46,0.20)" }} />
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              background: "rgba(166,138,46,0.04)",
              border: "1px solid rgba(166,138,46,0.10)",
              padding: "16px",
              marginTop: "16px",
            }}
          >
            <p style={{ fontSize: "11px", color: "#7a6e52", fontStyle: "italic", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px" }}>
              Pipeline is empty — StudEx is the first client. Phase 2 targets 3 pilot brands in Q3 2026.
            </p>
            <p style={{ fontSize: "10px", color: "#7a6e52", marginTop: "8px" }}>
              Target sectors: premium butcheries, specialty food brands, SA farming operations, AfricaBiz network members.
            </p>
          </div>
        </div>
      )}

      {/* ROADMAP */}
      {view === "roadmap" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {ROADMAP.map((phase) => (
            <div
              key={phase.phase}
              style={{
                background: phase.status === "live" ? "rgba(45,138,62,0.06)" : "rgba(201,168,76,0.02)",
                border: `1px solid ${phase.status === "live" ? "rgba(45,138,62,0.15)" : phase.status === "building" ? "rgba(166,138,46,0.15)" : "rgba(166,138,46,0.08)"}`,
                padding: "16px",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#7a6e52" }}>{phase.phase}</span>
                <span
                  style={{
                    fontSize: "8px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: phase.status === "live" ? "#2d8a3e" : phase.status === "building" ? "#a68a2e" : "#7a6e52",
                    border: `1px solid ${phase.status === "live" ? "rgba(45,138,62,0.20)" : phase.status === "building" ? "rgba(166,138,46,0.20)" : "rgba(154,138,90,0.2)"}`,
                    padding: "2px 6px",
                  }}
                >
                  {phase.status}
                </span>
              </div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1710", marginBottom: "2px" }}>{phase.label}</p>
              <p style={{ fontSize: "10px", color: "#a68a2e", marginBottom: "10px" }}>{phase.date}</p>
              {phase.items.map((item) => (
                <div key={item} className="flex items-center gap-2 mb-1.5">
                  <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: phase.status === "live" ? "#2d8a3e" : "#a68a2e", flexShrink: 0 }} />
                  <span style={{ fontSize: "10px", color: "#7a6e52" }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
