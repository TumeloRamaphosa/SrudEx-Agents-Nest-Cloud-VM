import { useState, useEffect } from 'react'
import './App.css'

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

const SERVER_URL = 'https://orgo-mcp.onrender.com'

const dpadButtons = [
  { label: '▲', action: 'up', top: 0, left: 90 },
  { label: '◀', action: 'left', top: 90, left: 0 },
  { label: '▼', action: 'down', top: 90, left: 90 },
  { label: '▶', action: 'right', top: 90, left: 180 },
]

function App() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [tvIP, setTvIP] = useState('')
  const [connected, setConnected] = useState(false)
  const [lastAction, setLastAction] = useState('')
  const [battery, setBattery] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('tv_ip')
    if (saved) setTvIP(saved)
    requestBattery()
  }, [])

  async function requestBattery() {
    try {
      // @ts-ignore
      if (navigator.getBattery) {
        // @ts-ignore
        const bat = await navigator.getBattery()
        setBattery(Math.round(bat.level * 100))
      }
    } catch {}
  }

  async function sendCommand(action: string) {
    if (!tvIP) {
      setStatus('error')
      setLastAction('Set TV IP first!')
      return
    }
    setStatus('sending')
    setLastAction(action.toUpperCase())

    try {
      // Try Samsung TV REST API first
      const res = await fetch(`http://${tvIP}:8001/api/v2/channels/samsung.tv.remote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setStatus('success')
        setConnected(true)
      } else {
        throw new Error('not supported')
      }
    } catch {
      // Fallback: try generic WOL or HTTP
      try {
        const r2 = await fetch(`${SERVER_URL}/tv/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: tvIP, action }),
        })
        if (r2.ok) setStatus('success')
        else throw new Error()
      } catch {
        setStatus('error')
        setLastAction(`Try: Settings → Network → TV IP`)
      }
    }

    setTimeout(() => setStatus('idle'), 1500)
  }

  function saveTVIP(ip: string) {
    setTvIP(ip)
    localStorage.setItem('tv_ip', ip)
  }

  return (
    <div className="app">
      <div className="header">
        <div className="logo">🏭 HomeClaw</div>
        <div className="status-row">
          {battery !== null && <span className="battery">🔋 {battery}%</span>}
          <span className={`conn-dot ${connected ? 'on' : 'off'}`} />
          <span className="conn-label">{connected ? 'TV Connected' : 'Not connected'}</span>
        </div>
      </div>

      <div className="setup-card">
        <label className="setup-label">📡 TV IP Address</label>
        <div className="ip-row">
          <input
            className="ip-input"
            placeholder="192.168.1.xx"
            value={tvIP}
            onChange={e => setTvIP(e.target.value)}
          />
          <button className="save-btn" onClick={() => saveTVIP(tvIP)}>Save</button>
        </div>
        <p className="setup-hint">
          JVC TV: Settings → Network → IP Settings<br />
          Samsung TV: Settings → General → Network → IP Settings
        </p>
      </div>

      <div className="remote-grid">
        {/* Power + D-pad column */}
        <div className="remote-col">
          <button
            className="btn-power"
            style={{ background: '#e53e3e', height: 120 }}
            onClick={() => sendCommand('power')}
          >
            <span className="btn-icon">⏻</span>
            <span className="btn-label">POWER</span>
          </button>

          <div className="dpad">
            {dpadButtons.map(btn => (
              <button
                key={btn.action}
                className={`dpad-btn dpad-${btn.action}`}
                style={{ top: btn.top, left: btn.left }}
                onClick={() => sendCommand(btn.action)}
              >
                {btn.label}
              </button>
            ))}
            <div className="dpad-center">
              <button className="btn-ok" onClick={() => sendCommand('ok')}>OK</button>
            </div>
          </div>
        </div>

        {/* Volume / Channel column */}
        <div className="remote-col">
          <button className="btn-std" style={{ background: '#3182ce' }} onClick={() => sendCommand('vol_up')}>
            <span className="btn-icon">🔊</span><span className="btn-label">VOL+</span>
          </button>
          <button className="btn-std" style={{ background: '#3182ce' }} onClick={() => sendCommand('vol_down')}>
            <span className="btn-icon">🔈</span><span className="btn-label">VOL−</span>
          </button>
          <button className="btn-std" style={{ background: '#2b6cb0' }} onClick={() => sendCommand('ch_up')}>
            <span className="btn-icon">⏫</span><span className="btn-label">CH+</span>
          </button>
          <button className="btn-std" style={{ background: '#2b6cb0' }} onClick={() => sendCommand('ch_down')}>
            <span className="btn-icon">⏬</span><span className="btn-label">CH−</span>
          </button>
          <button className="btn-std" style={{ background: '#553c9a' }} onClick={() => sendCommand('mute')}>
            <span className="btn-icon">🔇</span><span className="btn-label">MUTE</span>
          </button>
          <button className="btn-std" style={{ background: '#744210' }} onClick={() => sendCommand('menu')}>
            <span className="btn-icon">☰</span><span className="btn-label">MENU</span>
          </button>
        </div>

        {/* Quick actions column */}
        <div className="remote-col">
          <button className="btn-std" style={{ background: '#276749' }} onClick={() => sendCommand('source')}>
            <span className="btn-icon">📺</span><span className="btn-label">SOURCE</span>
          </button>
          <button className="btn-std" style={{ background: '#2c5282' }} onClick={() => sendCommand('hdmi')}>
            <span className="btn-icon">⚡</span><span className="btn-label">HDMI</span>
          </button>
          <button className="btn-std" style={{ background: '#c53030' }} onClick={() => sendCommand('red')}>
            <span className="btn-icon">🔴</span><span className="btn-label">RED</span>
          </button>
          <button className="btn-std" style={{ background: '#2f855a' }} onClick={() => sendCommand('green')}>
            <span className="btn-icon">🟢</span><span className="btn-label">GREEN</span>
          </button>
          <button className="btn-std" style={{ background: '#b7791f' }} onClick={() => sendCommand('yellow')}>
            <span className="btn-icon">🟡</span><span className="btn-label">YELLOW</span>
          </button>
          <button className="btn-std" style={{ background: '#2b6cb0' }} onClick={() => sendCommand('blue')}>
            <span className="btn-icon">🔵</span><span className="btn-label">BLUE</span>
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className={`status-bar ${status}`}>
        {status === 'idle' && <span className="status-text">Ready — tap any button</span>}
        {status === 'sending' && <span className="status-text">Sending {lastAction}...</span>}
        {status === 'success' && <span className="status-text">✅ {lastAction} sent!</span>}
        {status === 'error' && <span className="status-text">❌ {lastAction} — check TV IP</span>}
      </div>

      <div className="footer">
        <span>HomeClaw Remote — Dark Factory</span>
      </div>
    </div>
  )
}

export default App
