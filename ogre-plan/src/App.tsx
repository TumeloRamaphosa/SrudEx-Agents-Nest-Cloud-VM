import { useState } from 'react'

const aqua = '#00d4ff'
const indigo = '#6c63ff'
const red = '#ef4444'
const green = '#22c55e'
const amber = '#f59e0b'

interface PlanItem {
  id: string
  done: boolean
  owner: 'Tumelo' | 'Cipher'
  action: string
  detail: string
  urgent?: boolean
}

const KENYA_TASKS: PlanItem[] = [
  { id: 'k1', done: false, owner: 'Cipher', action: 'Confirm exact tender description + download specs', detail: 'Access KET portal → kenyatenders.com → Ref 145258865. AI training for Ivorian Customs via Kenya e-procurement platform.', urgent: true },
  { id: 'k2', done: false, owner: 'Tumelo', action: 'Get tender document + sign NDA if required', detail: 'Register / login at kenyatenders.com, download the full RFQ. Confirm entity name to use in proposal.', urgent: true },
  { id: 'k3', done: false, owner: 'Cipher', action: 'Draft proposal: OGRE AI Training Package', detail: 'Build: Custom AI/ML/LLM training curriculum + OGRE VM cloud labs access + instructor seat + certification tracking dashboard.', urgent: true },
  { id: 'k4', done: false, owner: 'Cipher', action: 'Price the package', detail: '参考: 20 participants × R12,500 = R250,000 baseline. Add OGRE VM lab access R45K. Total: R295,000–R450,000.', urgent: true },
  { id: 'k5', done: false, owner: 'Tumelo', action: 'Submit proposal before Jul 28 midnight', detail: 'Upload via KET portal. Confirm receipt. Send follow-up email to contact listed in RFQ.', urgent: true },
]

const QWEN_TASKS: PlanItem[] = [
  { id: 'q1', done: false, owner: 'Tumelo', action: 'Install Ollama on D@RK F@C#ORY', detail: 'Orgo Oracle → Web Terminal → run: curl -fsSL https://ollama.com/install.sh | sh && ollama pull qwen3:8b && echo DONE', urgent: true },
  { id: 'q2', done: false, owner: 'Cipher', action: 'Configure Claude Code on Mac Mini → D@RK F@C#ORY Ollama', detail: 'Set env ANTHROPIC_BASE_URL=http://100.74.71.60:11434/v1 on Mac Mini. Claude Code via Conductor routes to local Ollama.', urgent: true },
  { id: 'q3', done: false, owner: 'Cipher', action: 'Install Conductor on Mac Mini', detail: 'Download from conductor.build. Add Studex repos. Configure Conductor to use Claude Code with Ollama backend.', urgent: false },
  { id: 'q4', done: false, owner: 'Cipher', action: 'Run parallel agents via Conductor: 3× Claude Code', detail: 'Spawn 3 worktree agents: (1) OGRE Translate Assistant build, (2) KET Kenya tender doc, (3) OGRE Command Center features.', urgent: false },
  { id: 'q5', done: false, owner: 'Tumelo', action: 'Review + merge Conductor outputs', detail: 'Review code from all 3 agents in Conductor UI. Approve + merge into dark-factory repo.', urgent: false },
]

const BLOCKERS = [
  { what: 'KZN intro email', owner: 'Tumelo', since: 'Jul 21', urgent: '🔴 6 days overdue' },
  { what: 'KET Kenya specs', owner: 'Both', since: 'Today', urgent: '🔴 4 days left' },
  { what: 'Gmail app password', owner: 'Tumelo', since: 'Jul 14', urgent: '🔴 11 days overdue' },
  { what: 'etenders.gov.za reg', owner: 'Cipher', since: 'Jul 18', urgent: '🟡 7 days overdue' },
  { what: 'D@RK F@C#ORY Ollama', owner: 'Tumelo', since: 'Today', urgent: '🟡 Setup needed' },
]

function PlanCard({ title, icon, tasks, accent }: { title: string; icon: string; tasks: PlanItem[]; accent: string }) {
  const [items, setItems] = useState(tasks)
  const done = items.filter(t => t.done).length

  const toggle = (id: string) => setItems(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}30`, borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{title}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{done}/{items.length} complete</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: accent, fontWeight: 700 }}>
          {Math.round(done/items.length*100)}%
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${done/items.length*100}%`, background: accent, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>

      {items.map(task => (
        <div key={task.id} onClick={() => toggle(task.id)} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', opacity: task.done ? 0.5 : 1,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: 4, border: `2px solid ${task.done ? green : '#555'}`,
            background: task.done ? green : 'transparent', flexShrink: 0, marginTop: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {task.done && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: task.done ? '#888' : '#e8e8f0', textDecoration: task.done ? 'line-through' : 'none', fontWeight: 600 }}>
              {task.action}
              {task.urgent && <span style={{ marginLeft: 8, fontSize: 10, color: red, fontWeight: 700 }}>⚡ URGENT</span>}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{task.detail}</div>
            <div style={{ marginTop: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: task.owner === 'Tumelo' ? 'rgba(108,99,255,0.2)' : 'rgba(0,212,255,0.15)', color: task.owner === 'Tumelo' ? indigo : aqua }}>
                {task.owner}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<'kenya' | 'qwen' | 'blockers'>('kenya')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #09090e 0%, #0d0d1a 50%, #09090e 100%)', color: '#e8e8f0', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '0 0 60px' }}>
      {/* Header */}
      <div style={{ background: 'rgba(9,9,14,0.95)', borderBottom: '1px solid rgba(108,99,255,0.2)', padding: '20px 32px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: indigo, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>OGRE COMPUTER</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Space Grotesk', monospace" }}>🏭 ACTION PLAN — 2026-07-24</div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px' }}>
        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {([['kenya', '🇰🇪 KET Kenya', red], ['qwen', '🧠 Qwen3 on D@RK', aqua], ['blockers', '🚨 Blockers', amber]] as const).map(([key, label, color]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '8px 18px', borderRadius: 10, border: `1px solid ${tab === key ? color + '60' : 'rgba(255,255,255,0.1)'}`,
              background: tab === key ? color + '15' : 'transparent', color: tab === key ? color : '#888',
              fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Kenya tab */}
        {tab === 'kenya' && (
          <div>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 12 }}>🇰🇪 KET Kenya Tender — 4 DAYS LEFT</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
                {[
                  { label: 'Reference', value: 'KET 145258865' },
                  { label: 'Deadline', value: '28 Jul 2026' },
                  { label: 'Value Est.', value: 'R250–450K' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: '#888', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: aqua, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                <span style={{ color: amber, fontWeight: 700 }}>⚠ Description: </span>
                Specialized Training in AI, Machine Learning & Large Language Models — Ivorian Customs via Kenya e-procurement portal.
                Confirm full scope at <span style={{ color: aqua, fontFamily: "'JetBrains Mono', monospace" }}>kenyatenders.com</span>
              </div>
            </div>
            <PlanCard title="🇰🇪 KET Kenya Response Plan" icon="📋" tasks={KENYA_TASKS} accent={red} />
          </div>
        )}

        {/* Qwen tab */}
        {tab === 'qwen' && (
          <div>
            <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 12 }}>🧠 Qwen3-32B via Conductor + D@RK F@C#ORY</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7 }}>
                <div style={{ color: aqua, fontWeight: 700, marginBottom: 6 }}>Conductor is macOS only — D@RK F@C#ORY is Linux.</div>
                <div>The solution: <span style={{ color: '#fff', fontWeight: 700 }}>Run Conductor on Mac Mini</span>, but point Claude Code's API to <span style={{ color: aqua, fontFamily: "'JetBrains Mono', monospace" }}>D@RK F@C#ORY:11434</span> via Tailscale VPN.</div>
                <div style={{ marginTop: 8 }}>Mac Mini → Conductor → Claude Code → Ollama (D@RK F@C#ORY) → Free local inference</div>
              </div>
            </div>
            <PlanCard title="🧠 Qwen3 on D@RK F@C#ORY" icon="⚡" tasks={QWEN_TASKS} accent={aqua} />
          </div>
        )}

        {/* Blockers tab */}
        {tab === 'blockers' && (
          <div>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>All OGRE Blockers — Sorted by Urgency</div>
            {BLOCKERS.map(b => (
              <div key={b.what} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 18 }}>{b.urgent.startsWith('🔴') ? '🔴' : '🟡'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{b.what}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>Owner: <span style={{ color: b.owner === 'Tumelo' ? indigo : aqua, fontWeight: 700 }}>{b.owner}</span> · Since {b.since}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: b.urgent.startsWith('🔴') ? red : amber }}>{b.urgent}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 10, color: '#333', fontFamily: "'JetBrains Mono', monospace", marginTop: 40 }}>
        Cipher Tr@ce · Dark Factory · OGRE Computer · {new Date().toLocaleDateString('en-ZA')}
      </div>
    </div>
  )
}
