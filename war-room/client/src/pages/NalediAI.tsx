/**
 * Naledi AI Chat — Studex War Room
 * Built on Cult UI (nolly-studio/cult-ui)
 * Purpose: Direct chat interface with the Studex AI agent team
 * Models: GPT-4o, Claude Sonnet 4.5, Gemini 2.0 Flash, Perplexity
 */

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Send, Bot, Zap, TrendingUp, ShoppingBag, MessageSquare,
  ChevronRight, Loader2, Copy, CheckCheck, ExternalLink, X, Menu
} from "lucide-react";

// ── Cult UI AI Components ──────────────────────────────────────────
import { Conversation } from "@/components/cult-ai/ai-elements/conversation";
import { Message } from "@/components/cult-ai/ai-elements/message";
import { Persona } from "@/components/cult-ai/ai-elements/persona";
import { Shimmer } from "@/components/cult-ai/ai-elements/shimmer";
import { Plan } from "@/components/cult-ai/ai-elements/plan";
import { ModelSelector } from "@/components/cult-ai/ai-elements/model-selector";
import { ChainOfThought } from "@/components/cult-ai/ai-elements/chain-of-thought";

// ── Studex Brand Colors ────────────────────────────────────────────
const GOLD = "#C9A84C";
const GOLD_DIM = "#9a8a5a";
const OBSIDIAN = "#0A0A0F";
const CARD = "#1a1a14";
const CARD_BORDER = "rgba(201,168,76,0.15)";

// ── Agent Personas ─────────────────────────────────────────────────
const AGENTS = [
  {
    id: "naledi",
    name: "Naledi",
    role: "CMO — Content & Brand",
    description: "South African content strategist. Bold, culturally rooted. Creates posts, captions, campaigns.",
    avatar: "N",
    color: GOLD,
    systemPrompt: `You are Naledi, CMO of Studex Meat. 
- Post daily about: premium Wagyu beef, founder building AI agents in SA
- Tone: confident, visionary, authentic, culturally rooted in SA
- Always include stud.exchange link
- Brand voice: Black & Gold, luxury, CEO pace
- Never: discount-focused, apologetic, generic
- Customer names: initials only`,
    model: "gpt-4o",
  },
  {
    id: "charlie",
    name: "Charlie",
    role: "Orchestrator — Charlie OS",
    description: "Coordinates all Studex agents. Manages tasks, schedules, and cross-agent communication.",
    avatar: "C",
    color: "#3B82F6",
    systemPrompt: `You are Charlie, the orchestrator agent for Studex Meat.
- Coordinate: Auction bot, Content bot, Ops bot, CS bot, Wholesale bot
- Post daily standups to #charlie-os Slack at 07:00 SAST
- Track all agent activity and report to Tumelo Ramaphosa
- Two-brand separation: StudEx Meat ≠ StudEx Global Markets
- Money format: R prefix (e.g. R 1,450)
- Voice: bold, strategic, no fluff`,
    model: "claude-sonnet-4-5",
  },
  {
    id: "eddie",
    name: "EDDIE",
    role: "Ads Agent — Meta & Google",
    description: "Runs Facebook, Instagram, and Google Ads campaigns. Optimizes ROAS and budget allocation.",
    avatar: "E",
    color: "#10B981",
    systemPrompt: `You are EDDIE, the ads agent for Studex Meat.
- Ad Accounts: Meta act_560666565541381 | Google 2234319068
- Always-on: Performance Max campaigns targeting Johannesburg + Gauteng
- Campaign brief: Father's Day, Youth Day, flash auctions
- Budget rules: ROAS > 3.0 → increase 20%; ROAS < 1.0 → pause
- Report spend, ROAS, CTR, conversions clearly
- Never adjust budgets without Tumelo's approval`,
    model: "gemini-2.0-flash",
  },
  {
    id: "hermes",
    name: "Hermes",
    role: "DevOps — Infrastructure",
    description: "Manages VM, deployments, Supabase, Shopify API, and all technical infrastructure.",
    avatar: "H",
    color: "#8B5CF6",
    systemPrompt: `You are Hermes, CTO of Studex Meat.
- VM: Orgo.ai Ubuntu (67.213.119.157), 2CPU/8GB RAM
- Stack: Next.js 14, Hono, Supabase (jnb primary), BullMQ, Upstash, Vercel
- Repo: github.com/TumeloRamaphosa/SrudEx-Agents-Nest-Cloud-VM
- Always-on monitoring: uptime, CPU, RAM, disk
- Deploys: Vercel (app), Orgo VM (services)
- Report issues with severity and suggested fixes`,
    model: "claude-sonnet-4-5",
  },
  {
    id: "vera",
    name: "Vera",
    role: "Ops — Orders & Fulfilment",
    description: "Manages Shopify orders, inventory, TCG couriers, and customer delivery updates.",
    avatar: "V",
    color: "#F59E0B",
    systemPrompt: `You are Vera, ops agent for Studex Meat.
- Shopify: studexmeat.myshopify.com
- Courier: TCG (Courier Guy) API
- Fulfilment SLA: same-day if ordered before 14:00 SAST
- Customer privacy: initials only in all logs
- Inventory alerts: notify when stock < 5 units
- Report: orders today, pending fulfilments, stock levels`,
    model: "gpt-4o-mini",
  },
];

type ModelId = "gpt-4o" | "claude-sonnet-4-5" | "gemini-2.0-flash" | "perplexity";

const MODEL_LABELS: Record<ModelId, string> = {
  "gpt-4o": "GPT-4o",
  "claude-sonnet-4-5": "Claude Sonnet 4.5",
  "gemini-2.0-flash": "Gemini 2.0 Flash",
  "perplexity": "Perplexity",
};

// ── Message Type ───────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  agent: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  thinking?: string;
  model?: string;
}

// ── Streaming Chat Hook ───────────────────────────────────────────
function useStreamingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (prompt: string, agentId: string, model: ModelId) => {
    const agent = AGENTS.find((a) => a.id === agentId);
    if (!prompt.trim() || !agent) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      agent: "user",
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const assistantMsgId = `asst-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: assistantMsgId,
        agent: agentId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        model,
      },
    ]);

    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      // Route to OpenAI-compatible chat endpoint (server-side proxy)
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemPrompt: agent.systemPrompt,
          model,
          agentId,
        }),
        signal: abortRef.current.signal,
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: `⚠️ Error: ${err.message}` }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  return { messages, send, stop, isLoading };
}

// ── Quick Actions ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: "Naledi — Post Caption",
    prompt: "Write 3 Instagram captions for our Youth Day campaign. Theme: 'The Youth Shall Inherit the Flame'. Premium Wagyu biltong, Black-owned brand. Tone: bold, culturally rooted. Include hashtags.",
    agent: "naledi",
  },
  {
    label: "EDDIE — Ads Report",
    prompt: "Give me a full ads report. How are our Father's Day campaigns performing on Meta and Google? Include spend, ROAS, impressions, and recommendations.",
    agent: "eddie",
  },
  {
    label: "Vera — Order Status",
    prompt: "Check today's Shopify orders. How many unfulfilled? Any stock alerts? What's the current inventory on Wagyu Biltong 200g?",
    agent: "vera",
  },
  {
    label: "Hermes — System Health",
    prompt: "Run a full system health check. VM uptime, Supabase status, Shopify webhook connectivity, any failed deployments?",
    agent: "hermes",
  },
  {
    label: "Charlie — Daily Standup",
    prompt: "Generate a full daily standup report for Studex Meat. Cover: orders, content scheduled, ad performance, any blockers, and tomorrow's priorities.",
    agent: "charlie",
  },
  {
    label: "Naledi — Competitor Analysis",
    prompt: "Research our top 3 competitors in the SA premium meat market. What's their pricing, positioning, and social media strategy?",
    agent: "naledi",
  },
];

// ── Main Component ────────────────────────────────────────────────
export default function NalediAI() {
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [selectedModel, setSelectedModel] = useState<ModelId>("gpt-4o");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { messages, send, stop, isLoading } = useStreamingChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      send(input, activeAgent.id, selectedModel);
      setInput("");
    }
  };

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[0]) => {
    const agent = AGENTS.find((a) => a.id === action.agent);
    if (agent) setActiveAgent(agent);
    send(action.prompt, action.agent, selectedModel);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const agentMessages = messages.filter(
    (m) => m.agent === activeAgent.id || m.role === "user"
  );

  return (
    <div className="flex h-full gap-0" style={{ background: OBSIDIAN }}>
      {/* ── Left: Agent Sidebar ── */}
      <aside
        className="flex flex-col border-r shrink-0 overflow-y-auto"
        style={{
          width: sidebarOpen ? "240px" : "0px",
          background: "#111827",
          borderColor: CARD_BORDER,
          transition: "width 0.2s ease",
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: CARD_BORDER }}>
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: GOLD_DIM, letterSpacing: "3px" }}
          >
            Agent Team
          </p>
          <div className="space-y-1">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                style={{
                  background: activeAgent.id === agent.id
                    ? `${agent.color}18`
                    : "transparent",
                  border: `1px solid ${activeAgent.id === agent.id ? agent.color : "transparent"}`,
                  color: activeAgent.id === agent.id ? agent.color : "#9CA3AF",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: `${agent.color}22`, color: agent.color }}
                >
                  {agent.avatar}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold truncate">{agent.name}</p>
                  <p className="text-[10px] truncate" style={{ color: GOLD_DIM }}>
                    {agent.role.split("—")[0].trim()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Model selector */}
        <div className="p-4 border-b" style={{ borderColor: CARD_BORDER }}>
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: GOLD_DIM }}>
            Model
          </p>
          <div className="space-y-1">
            {(Object.keys(MODEL_LABELS) as ModelId[]).map((mid) => (
              <button
                key={mid}
                onClick={() => setSelectedModel(mid)}
                className="w-full text-left px-3 py-1.5 text-xs rounded"
                style={{
                  background: selectedModel === mid ? `${GOLD}18` : "transparent",
                  color: selectedModel === mid ? GOLD : "#6B7280",
                  border: `1px solid ${selectedModel === mid ? GOLD : "transparent"}`,
                }}
              >
                {MODEL_LABELS[mid]}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 flex-1">
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: GOLD_DIM }}>
            Today's Stats
          </p>
          <div className="space-y-2">
            {[
              { label: "Orders", value: "4", icon: ShoppingBag, color: "#10B981" },
              { label: "Revenue", value: "R 43,585", icon: TrendingUp, color: GOLD },
              { label: "Ad Spend", value: "R 1,240", icon: Zap, color: "#3B82F6" },
              { label: "Messages", value: "23", icon: MessageSquare, color: "#8B5CF6" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "#0D0D10", border: `1px solid ${CARD_BORDER}` }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                <span className="text-xs" style={{ color: "#9CA3AF" }}>{label}</span>
                <span className="ml-auto text-xs font-bold" style={{ color }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right: Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-b shrink-0"
          style={{ borderColor: CARD_BORDER, background: "#111827" }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-white/5 transition"
            style={{ color: GOLD_DIM }}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: `${activeAgent.color}22`, color: activeAgent.color }}>
            {activeAgent.avatar}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: activeAgent.color }}>
              {activeAgent.name}
            </p>
            <p className="text-[11px]" style={{ color: GOLD_DIM }}>
              {activeAgent.role}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: isLoading ? "#10B981" : "#6B7280" }}
            />
            <span className="text-[11px]" style={{ color: GOLD_DIM }}>
              {isLoading ? "Thinking..." : "Ready"}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Agent intro */}
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-1"
              style={{ background: `${activeAgent.color}22`, color: activeAgent.color }}
            >
              {activeAgent.avatar}
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: activeAgent.color }}>
                {activeAgent.name} — {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <div
                className="p-4 rounded-xl max-w-xl"
                style={{ background: CARD, border: `1px solid ${CARD_BORDER}` }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "#E5E7EB" }}>
                  {activeAgent.description}
                </p>
                <p className="text-xs mt-2" style={{ color: GOLD_DIM }}>
                  Ask me anything about {activeAgent.role.split("—")[1]?.trim().toLowerCase() || "Studex operations"}
                </p>
              </div>
            </div>
          </div>

          {/* Chat messages */}
          {messages.map((msg) => {
            const isAssistant = msg.role === "assistant";
            const agent = isAssistant ? AGENTS.find((a) => a.id === msg.agent) : null;
            return (
              <div key={msg.id} className="flex gap-3">
                {isAssistant && agent && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-1"
                    style={{ background: `${agent.color}22`, color: agent.color }}
                  >
                    {agent.avatar}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {isAssistant && agent && (
                    <p className="text-xs mb-1" style={{ color: agent.color }}>
                      {agent.name} · {MODEL_LABELS[msg.model as ModelId] || msg.model}
                    </p>
                  )}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: isAssistant ? CARD : `${activeAgent.color}10`,
                      border: `1px solid ${isAssistant ? CARD_BORDER : `${activeAgent.color}40`}`,
                    }}
                  >
                    {msg.thinking && (
                      <details className="mb-3">
                        <summary className="text-xs cursor-pointer" style={{ color: GOLD_DIM }}>
                          View reasoning...
                        </summary>
                        <pre
                          className="mt-2 p-3 rounded text-xs overflow-x-auto"
                          style={{ background: "#0D0D10", color: "#9CA3AF" }}
                        >
                          {msg.thinking}
                        </pre>
                      </details>
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: isAssistant ? "#E5E7EB" : "#D1D5DB" }}>
                      {msg.content || (isAssistant && isLoading ? (
                        <span className="inline-flex items-center gap-1" style={{ color: GOLD_DIM }}>
                          <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                        </span>
                      ) : null)}
                    </div>
                    {isAssistant && msg.content && (
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="mt-2 flex items-center gap-1 text-[11px] hover:opacity-70 transition"
                        style={{ color: GOLD_DIM }}
                      >
                        {copiedId === msg.id ? (
                          <><CheckCheck className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div
          className="px-6 py-3 border-t space-y-2 shrink-0"
          style={{ borderColor: CARD_BORDER, background: "#111827" }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: GOLD_DIM }}>
            Quick Actions
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] transition-all hover:opacity-80"
                style={{
                  background: "#0D0D10",
                  border: `1px solid ${CARD_BORDER}`,
                  color: "#9CA3AF",
                }}
              >
                <ChevronRight className="w-3 h-3" style={{ color: GOLD }} />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div
          className="px-6 py-4 border-t shrink-0"
          style={{ borderColor: CARD_BORDER, background: "#111827" }}
        >
          <div
            className="flex items-end gap-3 rounded-xl px-4 py-3"
            style={{ background: CARD, border: `1px solid ${CARD_BORDER}` }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message ${activeAgent.name}...`}
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none"
              style={{ maxHeight: "120px" }}
            />
            {isLoading ? (
              <button
                onClick={stop}
                className="p-2 rounded-lg transition hover:bg-white/5"
                style={{ color: "#EF4444" }}
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-lg transition disabled:opacity-30 hover:bg-white/5"
                style={{ color: GOLD }}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] mt-2" style={{ color: "#4B5563" }}>
            Press Enter to send · Shift+Enter for new line · {activeAgent.name} uses {MODEL_LABELS[selectedModel]}
          </p>
        </div>
      </div>
    </div>
  );
}
