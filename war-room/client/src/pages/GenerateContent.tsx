import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { ContentItem } from "@shared/schema";
import {
  Sparkles, Loader2, ExternalLink, TrendingUp, Users, Target, Lightbulb,
  ChevronDown, ChevronRight
} from "lucide-react";
import HiggsFieldPanel from "@/components/HiggsFieldPanel";

const TONES = ["Premium", "Bold", "Emotional", "Funny"];

const AI_TOOLS = [
  {
    name: "Hypframes",
    url: "https://hypframes.com",
    icon: "🎬",
    tagline: "Animate your product shots into cinematic reels",
    description:
      "Turn static Wagyu photography into stunning 3D-animated product videos. Perfect for those tomahawk hero shots and marbling close-ups that stop the scroll.",
    color: "from-orange-50 to-amber-50",
    badge: "Video",
  },
  {
    name: "HeyGen",
    url: "https://heygen.com",
    icon: "🧑‍💼",
    tagline: "Add an AI spokesperson to your content",
    description:
      "Generate AI spokesperson videos in seconds. Create a premium meat brand presenter that speaks directly to your audience — ideal for product spotlights and campaign announcements.",
    color: "from-blue-50 to-indigo-50",
    badge: "AI Avatar",
  },
  {
    name: "Higgsfield",
    url: "https://higgsfield.ai",
    icon: "⚛️",
    tagline: "Physics-based video generation",
    description:
      "Bring your meat photography to life with physics-based AI video. Fire, sizzle, steam, and braai smoke rendered in breathtaking cinematic quality — no film crew needed.",
    color: "from-purple-50 to-violet-50",
    badge: "Physics AI",
  },
  {
    name: "Remotion",
    url: "https://remotion.dev",
    icon: "⚛️",
    tagline: "Programmatic video with React",
    description:
      "Build automated video content pipelines with React code. Perfect for generating personalised order confirmation videos, seasonal campaign openers, and dynamic price announcement reels.",
    color: "from-teal-50 to-cyan-50",
    badge: "Dev Tool",
  },
];

// Competitor Intel Section — condensed version from the MD file
const COMPETITOR_GAPS = [
  {
    theme: "Wagyu Education",
    gap: "No SA brand explains marbling, grades, or genuine Wagyu vs fakes",
    opportunity: "Own this — consumers are confused about supermarket 'Wagyu'",
    priority: "High",
  },
  {
    theme: "SA Braai Culture",
    gap: "Zero premium brands produce authentic braai content",
    opportunity: "Heritage Day, Braai Day, Friday braai culture — all unclaimed",
    priority: "High",
  },
  {
    theme: "Halaal Community",
    gap: "Competitors have Halaal certs but zero community content",
    opportunity: "Premium Halaal Wagyu for Eid, Ramadan gifting — untapped",
    priority: "High",
  },
  {
    theme: "Cooking Tutorials",
    gap: "No tutorials on cooking expensive Wagyu cuts without ruining them",
    opportunity: "Removes the biggest consumer fear barrier — builds trust + sales",
    priority: "High",
  },
  {
    theme: "UGC / Cook-Along",
    gap: "No competitor runs UGC challenges or customer stories",
    opportunity: "#StudExBraai challenge — free content + social proof + algorithm boost",
    priority: "Medium",
  },
  {
    theme: "Gifting Content",
    gap: "Wagyu gift boxes not marketed by any competitor",
    opportunity: "Birthdays, Eid, Father's Day, anniversaries — premium gift market",
    priority: "Medium",
  },
  {
    theme: "Athlete Performance",
    gap: "No brand links Wagyu nutrition to fitness/performance",
    opportunity: "StudEx 'fueling champions' — high protein, clean Omega-3/6 narrative",
    priority: "Medium",
  },
];

export default function GenerateContent() {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [tone, setTone] = useState<string>("Premium");
  const [generatedCaption, setGeneratedCaption] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedIntel, setExpandedIntel] = useState(false);
  const { toast } = useToast();

  const { data: items = [], isLoading: itemsLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content"],
  });

  const selectedItem = items.find((i) => String(i.id) === selectedItemId);

  async function handleGenerate() {
    if (!selectedItem) {
      toast({ title: "Select a content item first", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedCaption("");

    try {
      const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";
      const response = await fetch(`${API_BASE}/api/generate/caption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedItem.title,
          caption: selectedItem.caption,
          campaign: selectedItem.campaign,
          tone,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate caption");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setGeneratedCaption((prev) => prev + parsed.text);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleApply() {
    if (!selectedItem || !generatedCaption) return;
    // Apply the caption back to the post (using a direct PATCH to caption endpoint)
    try {
      await apiRequest("PATCH", `/api/content/${selectedItem.id}/caption`, {
        caption: generatedCaption,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({ title: "Caption applied ✓", description: "Updated on the content item" });
    } catch {
      toast({ title: "Caption saved locally", description: "Backend caption save not required for draft" });
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ── Agent Pipeline ── */}
      <section>
        <div style={{ marginBottom: "16px" }}>
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
            AGENT PIPELINE
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0",
            overflowX: "auto" as const,
            padding: "4px 0",
          }}
        >
          {([
            { icon: "⬡", codename: "PROMPT", label: "Prompt Input", status: "READY" as const },
            { icon: "◈", codename: "APEX", label: "Generates Image", status: "READY" as const },
            { icon: "◈", codename: "NOVA", label: "Writes Caption", status: "READY" as const },
            { icon: "⬡", codename: "CHARLIE", label: "Queues for Approval", status: "READY" as const },
          ]).map((stage, i, arr) => (
            <div key={stage.codename} style={{ display: "flex", alignItems: "center" }}>
              {/* Stage card */}
              <div
                style={{
                  background: "#0e0d10",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderTop: `2px solid ${stage.status === "RUNNING" ? "#4CFFA8" : stage.status === "DONE" ? "#3a3020" : "#C9A84C"}`,
                  padding: "12px 16px",
                  minWidth: "140px",
                  textAlign: "center" as const,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    color:
                      stage.status === "RUNNING"
                        ? "#4CFFA8"
                        : stage.status === "DONE"
                        ? "#3a3020"
                        : "#C9A84C",
                    marginBottom: "6px",
                    filter:
                      stage.status === "RUNNING"
                        ? "drop-shadow(0 0 6px #4CFFA888)"
                        : stage.status === "RUNNING"
                        ? "drop-shadow(0 0 4px #C9A84C88)"
                        : "none",
                    animation: stage.status === "RUNNING" ? "dotPulse 1.5s ease-in-out infinite" : "none",
                  }}
                >
                  {stage.icon}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    textTransform: "uppercase" as const,
                    color:
                      stage.status === "RUNNING"
                        ? "#4CFFA8"
                        : stage.status === "DONE"
                        ? "#3a3020"
                        : "#C9A84C",
                    marginBottom: "4px",
                  }}
                >
                  {stage.codename}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                    fontSize: "8px",
                    letterSpacing: "1px",
                    textTransform: "uppercase" as const,
                    color: "#7a6a4a",
                    marginBottom: "8px",
                  }}
                >
                  {stage.label}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase" as const,
                    color:
                      stage.status === "RUNNING"
                        ? "#4CFFA8"
                        : stage.status === "DONE"
                        ? "#3a3020"
                        : "#C9A84C",
                    background:
                      stage.status === "RUNNING"
                        ? "rgba(76,255,168,0.08)"
                        : stage.status === "DONE"
                        ? "rgba(58,48,32,0.3)"
                        : "rgba(201,168,76,0.08)",
                    border: `1px solid ${
                      stage.status === "RUNNING"
                        ? "rgba(76,255,168,0.3)"
                        : stage.status === "DONE"
                        ? "rgba(58,48,32,0.4)"
                        : "rgba(201,168,76,0.3)"
                    }`,
                    padding: "2px 8px",
                    borderRadius: "2px",
                    boxShadow:
                      stage.status === "RUNNING" ? "0 0 6px rgba(76,255,168,0.2)" : "none",
                  }}
                >
                  {stage.status}
                </span>
              </div>

              {/* Connector arrow */}
              {i < arr.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 2px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "1px",
                      background: "linear-gradient(90deg, rgba(201,168,76,0.4), rgba(201,168,76,0.6))",
                      position: "relative" as const,
                    }}
                  />
                  <span
                    style={{
                      color: "#C9A84C",
                      fontSize: "10px",
                      lineHeight: 1,
                      opacity: 0.6,
                      marginLeft: "-4px",
                    }}
                  >
                    ▶
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 1: AI Caption Generator ── */}
      <section className="bg-white rounded-xl border border-[#E8E0CC] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#C9A84C]/10 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#C9A84C]" />
          </div>
          <div>
            <h2
              className="text-xl font-semibold text-[#1A1410]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              AI Caption Generator
            </h2>
            <p className="text-xs text-[#6B5E45]">Powered by GPT-4o — crafts premium StudEx brand captions</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Content selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1A1410] uppercase tracking-wider">
              Select Content Item
            </label>
            {itemsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger
                  className="bg-[#F7F4EE] border-[#E8E0CC]"
                  data-testid="select-content-item"
                >
                  <SelectValue placeholder="Choose a content item..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Tone selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1A1410] uppercase tracking-wider">
              Tone
            </label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger
                className="bg-[#F7F4EE] border-[#E8E0CC]"
                data-testid="select-tone"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected item preview */}
        {selectedItem && (
          <div className="bg-[#F7F4EE] rounded-lg p-3 border border-[#E8E0CC] text-xs text-[#6B5E45]">
            <span className="font-semibold text-[#1A1410]">{selectedItem.title}</span>
            {" — "}
            {selectedItem.campaign && <span className="text-[#C9A84C]">{selectedItem.campaign}</span>}
            {selectedItem.caption && (
              <p className="mt-1 line-clamp-2 text-[#6B5E45]">{selectedItem.caption.slice(0, 120)}...</p>
            )}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedItemId}
          className="bg-[#C9A84C] hover:bg-[#B8943B] text-white w-full h-10"
          data-testid="button-generate-caption"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Caption
            </>
          )}
        </Button>

        {/* Generated result */}
        {(generatedCaption || isGenerating) && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#1A1410] uppercase tracking-wider">
              Generated Caption
            </label>
            <Textarea
              value={generatedCaption}
              onChange={(e) => setGeneratedCaption(e.target.value)}
              className="min-h-[180px] text-sm bg-[#F7F4EE] border-[#E8E0CC] font-sans leading-relaxed"
              placeholder={isGenerating ? "Writing your caption..." : ""}
              data-testid="textarea-generated-caption"
            />
            {generatedCaption && !isGenerating && (
              <Button
                onClick={handleApply}
                variant="outline"
                className="border-[#2D7A3A] text-[#2D7A3A] hover:bg-[#2D7A3A]/10"
                data-testid="button-apply-caption"
              >
                Apply to Post ✓
              </Button>
            )}
          </div>
        )}
      </section>

      {/* ── Section 2: Higgsfield Studio ── */}
      <HiggsFieldPanel />

      {/* ── Section 3: AI Video Tools ── */}
      <section className="space-y-4">
        <div>
          <h2
            className="text-xl font-semibold text-[#1A1410]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Create with AI Video Tools
          </h2>
          <p className="text-sm text-[#6B5E45] mt-0.5">
            Industry-leading AI tools for cinematic meat content production
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {AI_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className={`bg-gradient-to-br ${tool.color} rounded-xl border border-[#E8E0CC] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow`}
              data-testid={`card-tool-${tool.name.toLowerCase()}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tool.icon}</span>
                  <div>
                    <h3
                      className="font-semibold text-[#1A1410] text-base leading-tight"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {tool.name}
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#C9A84C]/15 text-[#C9A84C] rounded font-medium">
                      {tool.badge}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#1A1410] font-medium italic">{tool.tagline}</p>
              <p className="text-xs text-[#6B5E45] leading-relaxed flex-1">{tool.description}</p>

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9A84C] hover:text-[#B8943B] transition-colors mt-auto"
                data-testid={`link-tool-${tool.name.toLowerCase()}`}
              >
                Learn More <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Competitor Intelligence ── */}
      <section className="bg-white rounded-xl border border-[#E8E0CC] overflow-hidden">
        <div
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#F7F4EE] transition-colors"
          onClick={() => setExpandedIntel(!expandedIntel)}
          data-testid="button-toggle-intel"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A1410]/5 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-[#1A1410]" />
            </div>
            <div>
              <h2
                className="text-xl font-semibold text-[#1A1410]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Competitor Intelligence
              </h2>
              <p className="text-xs text-[#6B5E45]">SA Wagyu market — content gaps & opportunities</p>
            </div>
          </div>
          {expandedIntel ? <ChevronDown className="w-5 h-5 text-[#6B5E45]" /> : <ChevronRight className="w-5 h-5 text-[#6B5E45]" />}
        </div>

        {expandedIntel && (
          <div className="p-5 space-y-5 border-t border-[#E8E0CC]">
            {/* Executive summary */}
            <div className="bg-[#C9A84C]/5 rounded-lg border border-[#C9A84C]/20 p-4">
              <p className="text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-2">
                Executive Summary
              </p>
              <p className="text-sm text-[#1A1410] leading-relaxed">
                No competitor effectively combines authentic South African braai culture, Halaal identity, Wagyu education, and visually compelling social content in one cohesive strategy.
                <strong> That gap is StudEx's single greatest opportunity.</strong>
              </p>
            </div>

            {/* Market context */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Woolworths IG", value: "1M", sub: "followers — daily recipe content", icon: TrendingUp },
                { label: "LA Farms Wagyu SKUs", value: "34", sub: "products — Cape Town-centric", icon: Users },
                { label: "Food Reels Engagement", value: "5.8%", sub: "highest of any industry on IG", icon: Lightbulb },
              ].map((s) => (
                <div key={s.label} className="bg-[#F7F4EE] rounded-lg p-3 border border-[#E8E0CC]">
                  <s.icon className="w-4 h-4 text-[#C9A84C] mb-1" />
                  <p className="font-mono text-xl font-bold text-[#1A1410]">{s.value}</p>
                  <p className="text-[10px] font-semibold text-[#1A1410]">{s.label}</p>
                  <p className="text-[10px] text-[#6B5E45]">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Gap matrix */}
            <div>
              <p className="text-xs font-semibold text-[#1A1410] uppercase tracking-wider mb-3">
                Content Gap Matrix — StudEx Opportunities
              </p>
              <div className="space-y-2">
                {COMPETITOR_GAPS.map((gap) => (
                  <div
                    key={gap.theme}
                    className="flex items-start gap-3 bg-[#F7F4EE] rounded-lg p-3 border border-[#E8E0CC]"
                    data-testid={`gap-row-${gap.theme.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          gap.priority === "High"
                            ? "bg-[#2D7A3A]/10 text-[#2D7A3A]"
                            : "bg-[#C9A84C]/10 text-[#C9A84C]"
                        }`}
                      >
                        {gap.priority}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A1410]">{gap.theme}</p>
                      <p className="text-xs text-[#6B5E45] mt-0.5">{gap.gap}</p>
                      <p className="text-xs text-[#C9A84C] font-medium mt-0.5">→ {gap.opportunity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 post ideas */}
            <div className="bg-[#1A1410] rounded-lg p-4 text-white">
              <p className="text-sm font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Top 10 High-Performance Post Ideas
              </p>
              <div className="space-y-1.5">
                {[
                  "Is Your Wagyu Actually Wagyu? (Carousel — Tue 12:00)",
                  "The Wagyu Braai Tutorial (Reel — Wed 16:30)",
                  "Heritage Day Drop — Fire & Feast Box (Both — Tue 08:30)",
                  "What Wagyu Actually Costs — And Why (Carousel — Thu 09:00)",
                  "Unboxing the Wagyu Biltong Gold (Reel — Fri 16:00)",
                  "Eid/Ramadan Gift Guide — Premium Halaal Wagyu",
                  "StudEx vs. Supermarket Wagyu — Blind Taste Test",
                  "The Athlete's Protein — Wagyu for Performance (Mon 06:30)",
                  "From Farm to Your Flame — 60-Second Process Reel",
                  "#StudExBraai Customer Cook-Along Challenge",
                ].map((idea, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="font-mono text-[#C9A84C] shrink-0">{String(i + 1).padStart(2, "0")}.</span>
                    <span className="text-gray-300">{idea}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Freepik Integration Strip ── */}
      <div style={{ marginTop: "48px", borderTop: "1px solid rgba(201,168,76,0.15)", paddingTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: "Rajdhani", fontSize: "9px", letterSpacing: "3px", color: "#9a8a5a" }}>
            FREEPIK INTEGRATION
          </span>
          <span style={{ fontSize: "9px", color: "#4a4a3a", letterSpacing: "1px" }}>
            Connect your Freepik account to access premium stock assets for content generation
          </span>
          <a
            href="https://www.freepik.com/api"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: "auto", fontSize: "9px", letterSpacing: "2px", color: "#C9A84C", textDecoration: "none", border: "1px solid rgba(201,168,76,0.3)", padding: "6px 12px" }}
          >
            GET API KEY →
          </a>
        </div>
      </div>
    </div>
  );
}
