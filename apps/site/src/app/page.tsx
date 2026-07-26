"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Factory, Mic, MicOff, Send, FileText, Link2, Clock,
  CheckCircle, Circle, ArrowRight, Zap, Package, Rocket, Crown,
  ChevronRight, AlertCircle, Loader2, Search, Users, BarChart3, Wrench,
} from "lucide-react";
import type { FactoryService, FactoryProject } from "@/lib/services-data";

const STATUS_STEPS = [
  { key: "intake", label: "Intake", icon: FileText },
  { key: "scope", label: "Scoping", icon: Zap },
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "sandbox-created", label: "Sandbox", icon: Package },
  { key: "building", label: "Building", icon: Loader2 },
  { key: "review-ready", label: "Review", icon: AlertCircle },
  { key: "delivered", label: "Delivered", icon: Rocket },
];

const TIER_ICONS: Record<string, typeof Zap> = {
  "lead-list": Users,
  "seo-audit": Search,
  "landing-page": FileText,
  "competitor-analysis": BarChart3,
  "small-code-fix": Wrench,
  "mvp-scope": Rocket,
  custom: Crown,
};

function StatusPipeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STATUS_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded"
              style={{
                background: active ? "rgba(201,168,76,0.15)" : done ? "rgba(76,255,168,0.08)" : "rgba(255,255,255,0.03)",
                border: active ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Icon className="w-3 h-3" style={{ color: active ? "#C9A84C" : done ? "#4CFFA8" : "#555" }} />
              <span style={{ fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: active ? "#C9A84C" : done ? "#4CFFA8" : "#555" }}>
                {step.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && <ChevronRight className="w-3 h-3" style={{ color: "#333" }} />}
          </div>
        );
      })}
    </div>
  );
}

function PaymentStages({ project }: { project: FactoryProject }) {
  const price = project.quotedPriceUsd;
  const [payingStage, setPayingStage] = useState<string | null>(null);
  if (!price) return null;
  const stages = [
    { label: "10% Plan Deposit", amount: price * 0.1, paid: project.depositPaid, stage: "deposit" },
    { label: "40% Build Payment", amount: price * 0.4, paid: project.buildPaid, stage: "build" },
    { label: "50% Final Delivery", amount: price * 0.5, paid: project.finalPaid, stage: "final" },
  ];

  const pay = async (stage: string) => {
    setPayingStage(stage);
    try {
      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, stage }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPayingStage(null);
      }
    } catch {
      setPayingStage(null);
    }
  };

  return (
    <div className="flex gap-3 mt-3">
      {stages.map((s) => (
        <div
          key={s.stage}
          className="flex-1 p-3 rounded"
          style={{
            background: s.paid ? "rgba(76,255,168,0.06)" : "rgba(255,255,255,0.03)",
            border: s.paid ? "1px solid rgba(76,255,168,0.2)" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            {s.paid ? <CheckCircle className="w-3 h-3" style={{ color: "#4CFFA8" }} /> : <Circle className="w-3 h-3" style={{ color: "#555" }} />}
            <span style={{ fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: s.paid ? "#4CFFA8" : "#9a8a5a" }}>
              {s.label}
            </span>
          </div>
          <span style={{ fontSize: "18px", fontWeight: 300, color: s.paid ? "#4CFFA8" : "#f5ecd0", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            ${s.amount.toLocaleString()}
          </span>
          {!s.paid && (
            <button
              onClick={() => pay(s.stage)}
              disabled={payingStage !== null}
              className="mt-2 w-full py-1.5 rounded transition-all"
              style={{
                background: payingStage === s.stage ? "rgba(201,168,76,0.2)" : "#C9A84C",
                color: payingStage === s.stage ? "#C9A84C" : "#0a0a0a",
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: payingStage !== null ? "not-allowed" : "pointer",
                opacity: payingStage !== null && payingStage !== s.stage ? 0.4 : 1,
              }}
            >
              {payingStage === s.stage ? "Redirecting…" : "Pay with PayFast"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function ServiceCard({ service, selected, onSelect }: { service: FactoryService; selected: boolean; onSelect: () => void }) {
  const Icon = TIER_ICONS[service.tier] || Zap;
  return (
    <button
      onClick={onSelect}
      className="text-left p-4 rounded transition-all"
      style={{
        background: selected ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.03)",
        border: selected ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: selected ? "#C9A84C" : "#9a8a5a" }} />
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#f5ecd0" }}>{service.title}</span>
      </div>
      <p style={{ fontSize: "11px", color: "#9a8a5a", marginBottom: "8px" }}>{service.description}</p>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: "11px", color: "#C9A84C" }}>
          {service.startingPriceUsd ? `From $${service.startingPriceUsd.toLocaleString()}` : "Custom Quote"}
        </span>
        <span style={{ fontSize: "10px", color: "#666" }}>{service.turnaround}</span>
      </div>
      {selected && service.features.length > 0 && (
        <ul className="mt-3 space-y-1">
          {service.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2" style={{ fontSize: "10px", color: "#9a8a5a" }}>
              <CheckCircle className="w-3 h-3 shrink-0" style={{ color: "#4CFFA8" }} />
              {f}
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}

function IntakeForm({ services, onSubmitted }: { services: FactoryService[]; onSubmitted: () => void }) {
  const [selectedService, setSelectedService] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunks.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        if (blob.size > 0) {
          setIsTranscribing(true);
          try {
            const formData = new FormData();
            formData.append("file", blob, "voice-note.webm");
            const res = await fetch("/api/factory/transcribe", { method: "POST", body: formData });
            if (res.ok) {
              const data = await res.json();
              setTranscription(data.text || data.transcription || "");
            }
          } catch {
            // Transcription service unavailable
          }
          setIsTranscribing(false);
        }
      };
      recorder.start(1000);
      mediaRecorder.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
    } catch {
      // Microphone not available
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
  }, []);

  const handleSubmit = async () => {
    if (!clientName || !clientEmail || !selectedService || !title) return;
    setIsSubmitting(true);
    setError("");
    try {
      const linkList = links.split("\n").map((l) => l.trim()).filter(Boolean);
      const res = await fetch("/api/factory/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          serviceId: selectedService,
          title,
          description: description || transcription,
          transcription: transcription || undefined,
          links: linkList.length > 0 ? linkList : undefined,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setClientName("");
      setClientEmail("");
      setTitle("");
      setDescription("");
      setLinks("");
      setTranscription("");
      setSelectedService("");
      onSubmitted();
    } catch {
      setError("Submission failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#9a8a5a", display: "block", marginBottom: "12px" }}>
          SELECT SERVICE TIER
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((svc) => (
            <ServiceCard key={svc.id} service={svc} selected={selectedService === svc.id} onSelect={() => setSelectedService(svc.id)} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#9a8a5a", display: "block", marginBottom: "6px" }}>YOUR NAME</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 rounded"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f5ecd0", fontSize: "13px", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#9a8a5a", display: "block", marginBottom: "6px" }}>EMAIL</label>
          <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="you@company.com" type="email" className="w-full px-3 py-2 rounded"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f5ecd0", fontSize: "13px", outline: "none" }} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#9a8a5a", display: "block", marginBottom: "6px" }}>PROJECT TITLE</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you building?" className="w-full px-3 py-2 rounded"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f5ecd0", fontSize: "13px", outline: "none" }} />
      </div>

      <div>
        <label style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#9a8a5a", display: "block", marginBottom: "8px" }}>
          VOICE NOTE — TELL US WHAT YOU NEED
        </label>
        <div className="flex items-center gap-3">
          <button onClick={isRecording ? stopRecording : startRecording}
            className="flex items-center gap-2 px-4 py-2.5 rounded transition-all"
            style={{
              background: isRecording ? "rgba(239,68,68,0.15)" : "rgba(201,168,76,0.1)",
              border: isRecording ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(201,168,76,0.3)",
              color: isRecording ? "#ef4444" : "#C9A84C",
              fontSize: "11px",
            }}>
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? `Stop Recording (${recordingDuration}s)` : "Record Voice Note"}
          </button>
          {isTranscribing && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#C9A84C" }} />
              <span style={{ fontSize: "11px", color: "#9a8a5a" }}>Transcribing...</span>
            </div>
          )}
        </div>
        {transcription && (
          <div className="mt-3 p-3 rounded" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <span style={{ fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", color: "#C9A84C", display: "block", marginBottom: "4px" }}>TRANSCRIPTION</span>
            <p style={{ fontSize: "12px", color: "#f5ecd0", lineHeight: 1.5 }}>{transcription}</p>
          </div>
        )}
      </div>

      <div>
        <label style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#9a8a5a", display: "block", marginBottom: "6px" }}>
          PROJECT DESCRIPTION (OR ADD TO VOICE NOTE)
        </label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you want built, key features, any specific requirements..." rows={4}
          className="w-full px-3 py-2 rounded resize-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f5ecd0", fontSize: "13px", outline: "none" }} />
      </div>

      <div>
        <label style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#9a8a5a", display: "block", marginBottom: "6px" }}>
          REFERENCE LINKS (ONE PER LINE)
        </label>
        <div className="flex items-start gap-2">
          <Link2 className="w-4 h-4 mt-2 shrink-0" style={{ color: "#666" }} />
          <textarea value={links} onChange={(e) => setLinks(e.target.value)}
            placeholder={"https://example.com/design-reference\nhttps://github.com/repo-to-fix"} rows={2}
            className="w-full px-3 py-2 rounded resize-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f5ecd0", fontSize: "13px", outline: "none" }} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSubmit}
          disabled={!clientName || !clientEmail || !selectedService || !title || isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded transition-all"
          style={{
            background: (!clientName || !clientEmail || !selectedService || !title) ? "rgba(255,255,255,0.05)" : "rgba(201,168,76,0.2)",
            border: "1px solid rgba(201,168,76,0.4)",
            color: "#C9A84C",
            fontSize: "10px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            cursor: (!clientName || !clientEmail || !selectedService || !title) ? "not-allowed" : "pointer",
            opacity: (!clientName || !clientEmail || !selectedService || !title) ? 0.5 : 1,
          }}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          SUBMIT PROJECT REQUEST
        </button>
        {error && <span style={{ fontSize: "11px", color: "#ef4444" }}>{error}</span>}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: FactoryProject }) {
  return (
    <div className="p-4 rounded" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#f5ecd0", marginBottom: "2px" }}>{project.title}</h3>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "10px", color: "#9a8a5a" }}>{project.clientName}</span>
            <span style={{ fontSize: "10px", color: "#666" }}>{project.clientEmail}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.quotedPriceUsd && (
            <span style={{ fontSize: "14px", fontWeight: 300, color: "#C9A84C", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              ${project.quotedPriceUsd.toLocaleString()}
            </span>
          )}
          <span className="px-2 py-0.5 rounded"
            style={{ fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
            {project.tier}
          </span>
        </div>
      </div>
      <StatusPipeline status={project.status} />
      {project.description && (
        <p style={{ fontSize: "11px", color: "#9a8a5a", marginTop: "10px", lineHeight: 1.5 }}>
          {project.description.slice(0, 200)}{project.description.length > 200 ? "..." : ""}
        </p>
      )}
      <PaymentStages project={project} />
      <div className="flex items-center justify-between mt-3">
        <span style={{ fontSize: "10px", color: "#555" }}>
          {new Date(project.createdAt).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
        <div className="flex items-center gap-2">
          {project.linearIssueId && (
            <span className="px-2 py-0.5 rounded" style={{ fontSize: "9px", background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
              Linear: {project.linearIssueId}
            </span>
          )}
          <span style={{ fontSize: "10px", color: "#666" }}>Review {project.reviewRound}/{project.maxReviews}</span>
        </div>
      </div>
    </div>
  );
}

export default function DarkFactoryPage() {
  const [view, setView] = useState<"intake" | "projects">("intake");
  const [services, setServices] = useState<FactoryService[]>([]);
  const [projects, setProjects] = useState<FactoryProject[]>([]);

  const fetchServices = useCallback(async () => {
    const res = await fetch("/api/factory/services");
    if (res.ok) setServices(await res.json());
  }, []);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/factory/projects");
    if (res.ok) setProjects(await res.json());
  }, []);

  useEffect(() => {
    fetchServices();
    fetchProjects();
  }, [fetchServices, fetchProjects]);

  useEffect(() => {
    if (view === "projects") fetchProjects();
  }, [view, fetchProjects]);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Hero header */}
      <header className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <Factory className="w-5 h-5" style={{ color: "#C9A84C" }} />
            <span style={{ fontSize: "10px", letterSpacing: "6px", textTransform: "uppercase", color: "#9a8a5a", fontFamily: "'Helvetica Neue', sans-serif" }}>
              DARK FACTORY
            </span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 300, color: "#f5ecd0", marginTop: "8px" }}>
            Automated Agent Development
          </h1>
          <p style={{ fontSize: "13px", color: "#9a8a5a", marginTop: "8px", maxWidth: "600px", lineHeight: 1.6 }}>
            Submit your project via voice note or text. Our AI agents scope, build, review, and ship your code.
            From bug fixes to full MVPs — delivered in days, not months.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* View toggle */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setView("intake")}
            className="flex items-center gap-2 px-4 py-2 rounded transition-all"
            style={{
              background: view === "intake" ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)",
              border: view === "intake" ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(255,255,255,0.06)",
              color: view === "intake" ? "#C9A84C" : "#9a8a5a",
              fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
            }}>
            <Send className="w-3.5 h-3.5" /> New Request
          </button>
          <button onClick={() => setView("projects")}
            className="flex items-center gap-2 px-4 py-2 rounded transition-all"
            style={{
              background: view === "projects" ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)",
              border: view === "projects" ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(255,255,255,0.06)",
              color: view === "projects" ? "#C9A84C" : "#9a8a5a",
              fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
            }}>
            <FileText className="w-3.5 h-3.5" /> Projects ({projects.length})
          </button>
        </div>

        {view === "intake" ? (
          <IntakeForm services={services} onSubmitted={() => { setView("projects"); fetchProjects(); }} />
        ) : (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <Factory className="w-8 h-8 mx-auto mb-3" style={{ color: "#333" }} />
                <p style={{ fontSize: "13px", color: "#9a8a5a" }}>No projects yet. Submit your first request.</p>
                <button onClick={() => setView("intake")}
                  className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 rounded"
                  style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontSize: "11px" }}>
                  <ArrowRight className="w-3.5 h-3.5" /> Submit Request
                </button>
              </div>
            ) : (
              projects.map((p) => <ProjectCard key={p.id} project={p} />)
            )}
          </div>
        )}

        {/* How it works */}
        <div className="p-6 rounded mt-12" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#9a8a5a", display: "block", marginBottom: "16px" }}>
            HOW IT WORKS
          </span>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Submit", desc: "Record a voice note or describe your project. Attach links, files, or references." },
              { step: "02", title: "Plan & Deposit", desc: "We scope your project with AI. Pay 10% deposit to lock in the plan." },
              { step: "03", title: "Build & Review", desc: "AI agents build in isolated sandboxes. 2-3 review rounds. Pay 40% to start." },
              { step: "04", title: "Ship & Deliver", desc: "Code reviewed via CodeRabbit, shipped to your repo. Pay remaining 50%." },
            ].map((item) => (
              <div key={item.step}>
                <span style={{ fontSize: "24px", fontWeight: 300, color: "rgba(201,168,76,0.3)", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{item.step}</span>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#f5ecd0", marginTop: "4px" }}>{item.title}</h4>
                <p style={{ fontSize: "11px", color: "#9a8a5a", marginTop: "4px", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4" style={{ color: "#C9A84C" }} />
            <span style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "#9a8a5a" }}>
              DARK FACTORY
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "#555" }}>Powered by AI Agent Development</span>
        </div>
      </footer>
    </div>
  );
}
