import { useState, useEffect } from 'react'

interface Machine {
  name: string
  ip: string
  status: 'online' | 'offline'
  type: string
  lastSeen?: string
}

interface Model {
  id: string
  provider: string
  status: 'ready' | 'pending' | 'unavailable'
  context: string
}

const aqua = '#00d4ff';

const NETWORK: Machine[] = [
  { name: 'dark-factory-orgo', ip: '100.74.71.60', status: 'online', type: 'D@RK F@C#ORY VM' },
  { name: 'maxclaw-vpm4p', ip: '100.121.69.92', status: 'online', type: 'OGRE Cloud Host', lastSeen: 'now' },
  { name: 'macbook-pro-5', ip: '100.95.66.29', status: 'offline', type: "Tumelo's MacBook Pro", lastSeen: '9h ago' },
  { name: 'projects-mac-mini', ip: '100.112.109.40', status: 'offline', type: 'Mac Mini (CI/CD)', lastSeen: '9h ago' },
  { name: 'naledi-cmo', ip: '100.91.156.104', status: 'online', type: 'Naledi CMO Agent' },
  { name: 'node', ip: '100.96.194.88', status: 'online', type: 'OpenClaw Node' },
]

const MODELS: Model[] = [
  { id: 'qwen3:32b', provider: 'Ollama (D@RK F@C#ORY)', status: 'pending', context: '32K' },
  { id: 'deepseek-coder:32b', provider: 'Ollama (D@RK F@C#ORY)', status: 'pending', context: '32K' },
  { id: 'kimi-k3:70b', provider: 'Moonshot API', status: 'pending', context: '1M' },
  { id: 'minimax/auto', provider: 'MaxClaw Cloud', status: 'ready', context: '200K' },
  { id: 'ollama/qwen3:32b', provider: 'OpenClaw Router', status: 'pending', context: '32K' },
]

const TOOLS = [
  { name: 'Conductor', desc: 'Parallel Claude Code agents on Mac', icon: '🍎', status: 'mac-only', link: 'conductor.build' },
  { name: 'Antigravity', desc: 'Free Google autonomous IDE + parallel agents', icon: '🚀', status: 'available', link: 'antigravity.google' },
  { name: 'Claude Code', desc: 'Feature shipping, deep reasoning, MCP-native', icon: '🤖', status: 'installed', link: 'claude.com/code' },
  { name: 'Cursor', desc: 'Best Tab autocomplete for daily editing', icon: '◉', status: 'installed', link: 'cursor.com' },
  { name: 'ego-lite', desc: 'Browser for AI agents — parallel browser Spaces', icon: '🌐', status: 'available', link: 'lite.ego.app' },
  { name: 'browser-use', desc: 'Open-source browser MCP — self-hosted', icon: '🖥️', status: 'available', link: 'github.com/browser-use' },
]

const TENDERS = [
  { name: 'KZNGFA-RFQ 2026-09', status: 'HOT', days: 6, value: 'R83,988/yr', note: 'Intro email pending — 3 days overdue' },
  { name: 'Ghana Data Centre AI', status: 'CLOSED', days: 0, value: 'R850K', note: 'Commission lost — confirm final status' },
  { name: 'etenders.gov.za', status: 'OVERDUE', days: -6, value: 'Pipeline', note: 'Registration 6+ days overdue — handling today' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'tenders'>('overview')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const onlineMachines = NETWORK.filter(m => m.status === 'online').length

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.factory}>🏭</span>
          <div>
            <div style={styles.title}>OGRE COMMAND CENTER</div>
            <div style={styles.subtitle}>DARK FACTORY sovereign stack · Cipher Tr@ce</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.time}>{time.toLocaleTimeString()}</div>
          <div style={styles.date}>{time.toLocaleDateString('en-ZA', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div style={styles.networkBadge}>🌐 tailf7273b.ts.net</div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={styles.tabs}>
        {(['overview', 'agents', 'tenders'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}>
            {tab === 'overview' && '📊'} {tab === 'overview' ? 'Overview' : tab === 'agents' ? '🤖 Agentic IDE' : '📋 Tenders'}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Status row */}
            <div style={styles.statusRow}>
              <div style={styles.statusCard}>
                <div style={styles.statusNum}>{onlineMachines}/{NETWORK.length}</div>
                <div style={styles.statusLabel}>Machines Online</div>
                <div style={styles.statusSub}>via Tailscale VPN</div>
              </div>
              <div style={styles.statusCard}>
                <div style={styles.statusNum}>3</div>
                <div style={styles.statusLabel}>Active Models</div>
                <div style={{ ...styles.statusSub, color: '#f59e0b' }}>Kimi K3 drops Jul 27</div>
              </div>
              <div style={styles.statusCard}>
                <div style={{ ...styles.statusNum, color: '#ef4444' }}>6</div>
                <div style={styles.statusLabel}>Days to KZN Close</div>
                <div style={{ ...styles.statusSub, color: '#ef4444' }}>Intro email overdue</div>
              </div>
              <div style={styles.statusCard}>
                <div style={styles.statusNum}>R45K</div>
                <div style={styles.statusLabel}>MRR</div>
                <div style={styles.statusSub}>Pipeline R6-20M+</div>
              </div>
            </div>

            {/* Network grid */}
            <h2 style={styles.sectionTitle}>🌐 Tailscale Network — tailf7273b.ts.net</h2>
            <div style={styles.machineGrid}>
              {NETWORK.map(m => (
                <div key={m.ip} style={{ ...styles.machineCard, ...(m.status === 'online' ? styles.machineOnline : styles.machineOffline) }}>
                  <div style={styles.machineHeader}>
                    <span style={styles.machineDot} data-online={m.status === 'online'} />
                    <span style={styles.machineName}>{m.name}</span>
                  </div>
                  <div style={styles.machineIp}>{m.ip}</div>
                  <div style={styles.machineType}>{m.type}</div>
                  {m.lastSeen && <div style={styles.machineLastSeen}>{m.lastSeen}</div>}
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
            <div style={styles.actionGrid}>
              <button style={styles.actionBtn}>
                🚀 Pull Ollama Models<br/><span style={styles.actionSub}>D@RK F@C#ORY</span>
              </button>
              <button style={styles.actionBtn}>
                🌐 Test Tailscale<br/><span style={styles.actionSub}>Ping all nodes</span>
              </button>
              <button style={styles.actionBtn}>
                🤖 Spawn Claude Code<br/><span style={styles.actionSub}>Autonomous agent</span>
              </button>
              <button style={styles.actionBtn}>
                📂 New OGRE Project<br/><span style={styles.actionSub}>Ship in 2 hours</span>
              </button>
              <button style={styles.actionBtn} onClick={() => setActiveTab('tenders')}>
                📋 View Tenders<br/><span style={styles.actionSub}>3 active</span>
              </button>
              <button style={styles.actionBtn}>
                🧪 Test Ollama<br/><span style={styles.actionSub}>Local inference</span>
              </button>
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div>
            <h2 style={styles.sectionTitle}>🤖 Agentic IDE Stack</h2>
            <div style={styles.killerBadge}>THE KILLER COMBO: Cursor + Antigravity + Claude Code</div>

            <div style={styles.toolsGrid}>
              {TOOLS.map(t => (
                <div key={t.name} style={styles.toolCard}>
                  <div style={styles.toolIcon}>{t.icon}</div>
                  <div style={styles.toolInfo}>
                    <div style={styles.toolName}>{t.name}</div>
                    <div style={styles.toolDesc}>{t.desc}</div>
                    <div style={styles.toolStatus} data-status={t.status}>
                      {t.status === 'installed' ? '✅ Installed' : t.status === 'available' ? '🌐 Available free' : '🍎 macOS only'}
                    </div>
                  </div>
                  <a href={`https://${t.link}`} target="_blank" style={styles.toolLink}>→</a>
                </div>
              ))}
            </div>

            <h2 style={styles.sectionTitle}>🧠 Model Routing</h2>
            <div style={styles.modelTable}>
              {MODELS.map(m => (
                <div key={m.id} style={styles.modelRow}>
                  <span style={styles.modelDot} data-status={m.status} />
                  <div style={styles.modelId}>{m.id}</div>
                  <div style={styles.modelProvider}>{m.provider}</div>
                  <div style={styles.modelCtx}>{m.context} ctx</div>
                  <div style={styles.modelStatus} data-status={m.status}>{m.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TENDERS TAB */}
        {activeTab === 'tenders' && (
          <div>
            <h2 style={styles.sectionTitle}>📋 Active Opportunities</h2>
            {TENDERS.map(t => (
              <div key={t.name} style={{ ...styles.tenderCard, ...(t.status === 'HOT' ? styles.tenderHot : t.status === 'CLOSED' ? styles.tenderClosed : styles.tenderWarning) }}>
                <div style={styles.tenderHeader}>
                  <span style={styles.tenderName}>{t.name}</span>
                  <span style={styles.tenderBadge} data-status={t.status}>{t.status}</span>
                </div>
                <div style={styles.tenderMeta}>
                  <span>💰 {t.value}</span>
                  <span>⏱ {t.days > 0 ? `${t.days} days left` : t.days === 0 ? 'Closed today' : `${Math.abs(t.days)} days overdue`}</span>
                </div>
                <div style={styles.tenderNote}>⚠️ {t.note}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        Cipher Tr@ce · Dark Factory · OGRE OS · {new Date().getFullYear()}
        &nbsp;|&nbsp; Tailscale: {onlineMachines} nodes · Ollama: ready · Kimi K3: 3 days
      </footer>
    </div>
  )
}


const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #09090e 0%, #0d0d1a 50%, #09090e 100%)',
    color: '#e8e8f0',
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    borderBottom: '1px solid rgba(108,99,255,0.2)',
    background: 'rgba(9,9,14,0.9)',
    backdropFilter: 'blur(20px)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  factory: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: 800, letterSpacing: 2, color: '#fff', fontFamily: "'Space Grotesk', monospace" },
  subtitle: { fontSize: 11, color: '#6c63ff', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" },
  headerRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  time: { fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: aqua },
  date: { fontSize: 11, color: '#888', fontFamily: "'JetBrains Mono', monospace" },
  networkBadge: { fontSize: 10, color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: 12, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" },
  tabs: { display: 'flex', gap: 4, padding: '12px 32px', borderBottom: '1px solid rgba(108,99,255,0.15)', background: 'rgba(9,9,14,0.5)' },
  tab: { background: 'transparent', border: 'none', color: '#888', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' },
  tabActive: { background: 'rgba(108,99,255,0.2)', color: '#fff', border: '1px solid rgba(108,99,255,0.4)' },
  main: { flex: 1, padding: '28px 32px', maxWidth: 1200 },
  statusRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 },
  statusCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 12, padding: 20, textAlign: 'center' },
  statusNum: { fontSize: 32, fontWeight: 800, color: aqua, fontFamily: "'Space Grotesk', monospace" },
  statusLabel: { fontSize: 12, color: '#fff', fontWeight: 700, marginTop: 4 },
  statusSub: { fontSize: 10, color: '#4ade80', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, marginTop: 8 },
  machineGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 },
  machineCard: { border: '1px solid', borderRadius: 10, padding: 16, position: 'relative' },
  machineOnline: { background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.3)' },
  machineOffline: { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' },
  machineHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  machineDot: { width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' },
  machineName: { fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'JetBrains Mono', monospace" },
  machineIp: { fontSize: 16, color: aqua, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 },
  machineType: { fontSize: 11, color: '#888' },
  machineLastSeen: { fontSize: 10, color: '#555', marginTop: 6, fontFamily: "'JetBrains Mono', monospace" },
  actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 },
  actionBtn: { background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, padding: '16px 20px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.2s', textAlign: 'left', lineHeight: 1.5 },
  actionSub: { fontSize: 10, color: '#888', fontWeight: 400 },
  killerBadge: { background: 'linear-gradient(90deg, rgba(108,99,255,0.2), rgba(0,212,255,0.2))', border: '1px solid rgba(108,99,255,0.4)', borderRadius: 20, padding: '10px 20px', textAlign: 'center', color: aqua, fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 20 },
  toolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 },
  toolCard: { display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 10, padding: 16 },
  toolIcon: { fontSize: 28, width: 44, textAlign: 'center' },
  toolInfo: { flex: 1 },
  toolName: { fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 },
  toolDesc: { fontSize: 11, color: '#888', marginBottom: 6 },
  toolStatus: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, display: 'inline-block' },
  toolLink: { color: aqua, fontSize: 18, textDecoration: 'none', padding: '4px 8px' },
  modelTable: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 },
  modelRow: { display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 8, padding: '10px 16px' },
  modelDot: { width: 8, height: 8, borderRadius: '50%' },
  modelId: { flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: aqua },
  modelProvider: { fontSize: 11, color: '#888', width: 200 },
  modelCtx: { fontSize: 11, color: '#888', width: 80, textAlign: 'right' },
  modelStatus: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, width: 80, textAlign: 'center' },
  tenderCard: { border: '1px solid', borderRadius: 12, padding: 20, marginBottom: 16 },
  tenderHot: { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.4)' },
  tenderClosed: { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' },
  tenderWarning: { background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.4)' },
  tenderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tenderName: { fontSize: 15, fontWeight: 700, color: '#fff' },
  tenderBadge: { fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 12, letterSpacing: 1 },
  tenderMeta: { display: 'flex', gap: 24, fontSize: 12, color: '#aaa', marginBottom: 8 },
  tenderNote: { fontSize: 11, color: '#888' },
  footer: { textAlign: 'center', padding: '16px', fontSize: 10, color: '#444', fontFamily: "'JetBrains Mono', monospace", borderTop: '1px solid rgba(255,255,255,0.05)' },
}
