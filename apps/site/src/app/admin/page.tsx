"use client";

import { useCallback, useEffect, useState } from "react";
import type { FactoryProject } from "@/lib/services-data";

const PIPELINE_STATUSES = [
  "intake",
  "scope",
  "approved",
  "sandbox-created",
  "building",
  "review-ready",
  "delivered",
];

export default function AdminConsole() {
  const [authenticated, setAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<FactoryProject[]>([]);

  const loadProjects = useCallback(async () => {
    const res = await fetch("/api/factory/projects");
    if (res.status === 401) {
      setAuthenticated(false);
      return;
    }
    if (res.ok) {
      setAuthenticated(true);
      setProjects(await res.json());
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const signIn = async () => {
    setError(null);
    const res = await fetch("/api/factory/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    if (res.ok) {
      setApiKey("");
      await loadProjects();
    } else {
      setError("Invalid admin key");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/factory/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await loadProjects();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="p-8 rounded" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", minWidth: 320 }}>
          <span style={{ fontSize: "10px", letterSpacing: "6px", textTransform: "uppercase", color: "#9a8a5a" }}>
            Dark Factory · Admin
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 300, color: "#f5ecd0", margin: "8px 0 16px" }}>
            Operator sign in
          </h1>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Admin API key"
            className="w-full px-3 py-2 rounded mb-3"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: "#f5ecd0", fontSize: "13px" }}
          />
          {error && <p style={{ color: "#ff6b6b", fontSize: "11px", marginBottom: "8px" }}>{error}</p>}
          <button
            onClick={signIn}
            className="w-full py-2 rounded"
            style={{ background: "#C9A84C", color: "#0a0a0a", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "30px", fontWeight: 300, color: "#f5ecd0" }}>
          Operator console
        </h1>
        <p style={{ fontSize: "12px", color: "#9a8a5a", marginBottom: "24px" }}>{projects.length} projects</p>
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="p-4 rounded" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <span style={{ fontSize: "14px", color: "#f5ecd0" }}>{project.title}</span>
                  <span style={{ fontSize: "11px", color: "#9a8a5a", marginLeft: 8 }}>{project.clientName} · {project.clientEmail}</span>
                </div>
                <select
                  value={project.status}
                  onChange={(event) => updateStatus(project.id, event.target.value)}
                  style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: "#C9A84C", fontSize: "11px", padding: "4px 8px", borderRadius: 4 }}
                >
                  {PIPELINE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: "10px", color: "#666", marginTop: 6 }}>
                Deposit {project.depositPaid ? "✓" : "—"} · Build {project.buildPaid ? "✓" : "—"} · Final {project.finalPaid ? "✓" : "—"}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
