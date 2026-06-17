import { CreditCard, CheckCircle, AlertCircle, XCircle, DollarSign, Shield, Zap, ExternalLink } from "lucide-react";

const PAYFAST_CONFIG = {
  merchantId: "12946117",
  merchantKey: "ogj0vbl5dkgg9",
  passphrase: "— Not yet set",
  environment: "LIVE",
  status: "active",
};

const PAYMENT_METHODS = [
  {
    name: "PayFast",
    type: "Primary Gateway",
    status: "active",
    logo: "PF",
    color: "#4CFFA8",
    details: "All major SA cards, EFT, SnapScan, Zapper, Masterpass",
    transactions: "Live",
    fee: "3.5% + R2.00",
  },
  {
    name: "Stitch",
    type: "Legacy Gateway",
    status: "removing",
    logo: "ST",
    color: "#c14e3c",
    details: "Open banking / EFT — causing payout delays",
    transactions: "Deactivating",
    fee: "1.5%",
  },
];

const RECENT_TX = [
  { order: "#1949", customer: "A.F.", amount: "R897.50", method: "PayFast", status: "settled" },
  { order: "#1948", customer: "E.U.M.", amount: "R1,300.00", method: "PayFast", status: "settled" },
  { order: "#1947", customer: "R.I.", amount: "R5,865.00", method: "PayFast", status: "settled" },
  { order: "#1946", customer: "C.G.", amount: "R1,610.00", method: "PayFast", status: "unfulfilled" },
  { order: "#1945", customer: "C.G.", amount: "R7,245.00", method: "PayFast", status: "unfulfilled" },
];

export default function Payments() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4" style={{ color: "#C9A84C" }} />
          <span style={{ fontSize: "9px", letterSpacing: "5px", textTransform: "uppercase", color: "#9a8a5a", fontFamily: "'Helvetica Neue', sans-serif" }}>
            PAYMENTS — GATEWAY MANAGEMENT
          </span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 300, color: "#f5ecd0" }}>
          Payment Configuration
        </h2>
      </div>

      {/* Alert: Stitch removal */}
      <div
        style={{
          background: "rgba(193,78,60,0.08)",
          border: "1px solid rgba(193,78,60,0.3)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#c14e3c" }} />
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#f5ecd0", marginBottom: "2px" }}>Stitch Payment Removal In Progress</p>
          <p style={{ fontSize: "11px", color: "#9a8a5a" }}>
            Stitch is being removed as it has caused payout delays. PayFast is set as the sole payment gateway.
            Complete removal in Shopify Admin → Settings → Payments → Deactivate Stitch.
          </p>
        </div>
      </div>

      {/* Active gateways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PAYMENT_METHODS.map((pm) => (
          <div
            key={pm.name}
            style={{
              background: "rgba(10,10,12,0.9)",
              border: `1px solid ${pm.status === "active" ? "rgba(76,255,168,0.2)" : "rgba(193,78,60,0.25)"}`,
              padding: "18px",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: pm.status === "active" ? "rgba(76,255,168,0.1)" : "rgba(193,78,60,0.1)",
                    border: `1px solid ${pm.status === "active" ? "rgba(76,255,168,0.3)" : "rgba(193,78,60,0.3)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: pm.status === "active" ? "#4CFFA8" : "#c14e3c",
                    fontFamily: "Menlo, monospace",
                  }}
                >
                  {pm.logo}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#f5ecd0" }}>{pm.name}</p>
                  <p style={{ fontSize: "9px", color: "#9a8a5a", textTransform: "uppercase", letterSpacing: "1px" }}>{pm.type}</p>
                </div>
              </div>
              <span
                style={{
                  fontSize: "8px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: pm.status === "active" ? "#4CFFA8" : "#c14e3c",
                  border: `1px solid ${pm.status === "active" ? "rgba(76,255,168,0.3)" : "rgba(193,78,60,0.3)"}`,
                  padding: "2px 8px",
                }}
              >
                {pm.status === "active" ? "ACTIVE" : "REMOVING"}
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "#9a8a5a", marginBottom: "8px" }}>{pm.details}</p>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "10px", color: "#9a8a5a" }}>Fee: <span style={{ color: "#f5ecd0", fontFamily: "Menlo, monospace" }}>{pm.fee}</span></span>
              <span style={{ fontSize: "10px", color: pm.status === "active" ? "#4CFFA8" : "#c14e3c" }}>{pm.transactions}</span>
            </div>
          </div>
        ))}
      </div>

      {/* PayFast config */}
      <div style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)", padding: "18px" }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
          <span style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "#9a8a5a" }}>PayFast Live Credentials</span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "8px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#4CFFA8",
              border: "1px solid rgba(76,255,168,0.3)",
              padding: "2px 6px",
            }}
          >
            LIVE ENV
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Merchant ID", value: PAYFAST_CONFIG.merchantId },
            { label: "Merchant Key", value: PAYFAST_CONFIG.merchantKey },
            { label: "Passphrase", value: PAYFAST_CONFIG.passphrase },
          ].map((field) => (
            <div key={field.label}>
              <p style={{ fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8a5a", marginBottom: "4px" }}>{field.label}</p>
              <p style={{ fontSize: "12px", fontFamily: "Menlo, monospace", color: "#f5ecd0", background: "rgba(255,255,255,0.04)", padding: "6px 8px", border: "1px solid rgba(201,168,76,0.1)" }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: "12px",
            background: "rgba(201,168,76,0.06)",
            border: "1px solid rgba(201,168,76,0.15)",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle className="w-3 h-3" style={{ color: "#C9A84C" }} />
          <span style={{ fontSize: "10px", color: "#9a8a5a" }}>
            Passphrase required for ITN validation. Set it in{" "}
            <a href="https://www.payfast.io/login" target="_blank" rel="noopener noreferrer" style={{ color: "#C9A84C" }}>
              PayFast dashboard → Settings → Account Details
            </a>
          </span>
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <p style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "#9a8a5a", marginBottom: "10px" }}>RECENT TRANSACTIONS</p>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
                {["Order", "Customer", "Amount", "Gateway", "Status"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8a5a" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_TX.map((tx) => (
                <tr key={tx.order} style={{ borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
                  <td style={{ padding: "10px", fontSize: "11px", fontFamily: "Menlo, monospace", color: "#C9A84C" }}>{tx.order}</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>{tx.customer}</td>
                  <td style={{ padding: "10px", fontSize: "12px", fontFamily: "Menlo, monospace", color: "#f5ecd0" }}>{tx.amount}</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#9a8a5a" }}>{tx.method}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{
                      fontSize: "8px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: tx.status === "settled" ? "#4CFFA8" : "#C9A84C",
                      border: `1px solid ${tx.status === "settled" ? "rgba(76,255,168,0.25)" : "rgba(201,168,76,0.25)"}`,
                      padding: "2px 6px",
                    }}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
