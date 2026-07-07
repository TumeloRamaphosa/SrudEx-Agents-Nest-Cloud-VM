/**
 * AI Credits Dashboard — Studex Super Agents War Room
 * Displays client credit balance, transaction history, and purchase options
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Coins, Plus, Minus, ArrowUpRight, ArrowDownRight,
  CreditCard, Zap, Users, RefreshCw, ExternalLink
} from "lucide-react";

const GOLD = "#a68a2e";
const GOLD_DIM = "#7a6e52";

type Transaction = {
  id: number;
  clientId: number;
  amount: number;
  type: string;
  description: string | null;
  balanceAfter: number;
  paymentRef: string | null;
  createdAt: string;
};

type ClientCredits = {
  clientId: number;
  name: string;
  tier: string;
  balance: number;
  monthlyAllocation: number;
  transactions: Transaction[];
};

type Client = {
  id: number;
  name: string;
  email: string;
  tier: string;
  aiCredits: number;
  monthlyAllocation: number;
  createdAt: string;
};

const TIER_LABELS: Record<string, string> = {
  "meat-os": "Meat OS",
  "agency-os": "Agency OS",
  "marketplace-os": "Marketplace OS",
};

const TIER_PRICES: Record<string, string> = {
  "meat-os": "R8,500/mo",
  "agency-os": "R18,500/mo",
  "marketplace-os": "R24,000/mo",
};

const CREDIT_PACKAGES = [
  { credits: 100, price: "R250", priceNum: 250 },
  { credits: 500, price: "R1,000", priceNum: 1000 },
  { credits: 1000, price: "R1,800", priceNum: 1800 },
  { credits: 2500, price: "R4,000", priceNum: 4000 },
];

export default function AICredits() {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", tier: "meat-os" });

  const { data: clientsList = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    queryFn: () => fetch("/api/clients").then((r) => r.json()),
  });

  const { data: creditData } = useQuery<ClientCredits>({
    queryKey: ["/api/clients", selectedClientId, "credits"],
    queryFn: () => fetch(`/api/clients/${selectedClientId}/credits`).then((r) => r.json()),
    enabled: !!selectedClientId,
  });

  const createClientMut = useMutation({
    mutationFn: (data: { name: string; email: string; tier: string }) =>
      fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: (client: Client) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setSelectedClientId(client.id);
      setShowAddClient(false);
      setNewClient({ name: "", email: "", tier: "meat-os" });
    },
  });

  const purchaseMut = useMutation({
    mutationFn: (data: { amount: number; description: string }) =>
      fetch(`/api/clients/${selectedClientId}/credits/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", selectedClientId, "credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
  });

  const activeClient = clientsList.find((c) => c.id === selectedClientId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: "28px",
              color: "#1a1710",
              lineHeight: 1.25,
            }}
          >
            AI Credits
          </p>
          <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: GOLD_DIM, marginTop: "4px" }}>
            Super Agents Credit Management
          </p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: GOLD, color: "#ffffff", border: "none",
            padding: "8px 16px", fontSize: "11px", letterSpacing: "2px",
            textTransform: "uppercase", cursor: "pointer",
          }}
        >
          <Plus size={12} /> Add Client
        </button>
      </div>

      {/* Add Client Form */}
      {showAddClient && (
        <div
          style={{
            background: "#ffffff", border: `1px solid rgba(166,138,46,0.18)`,
            padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: GOLD, marginBottom: "12px" }}>
            New Client
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              placeholder="Client Name"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              style={{
                flex: 1, minWidth: "200px", padding: "8px 12px",
                border: "1px solid rgba(166,138,46,0.18)", background: "#faf8f4",
                fontSize: "13px", color: "#1a1710", outline: "none",
              }}
            />
            <input
              placeholder="Email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              style={{
                flex: 1, minWidth: "200px", padding: "8px 12px",
                border: "1px solid rgba(166,138,46,0.18)", background: "#faf8f4",
                fontSize: "13px", color: "#1a1710", outline: "none",
              }}
            />
            <select
              value={newClient.tier}
              onChange={(e) => setNewClient({ ...newClient, tier: e.target.value })}
              style={{
                padding: "8px 12px", border: "1px solid rgba(166,138,46,0.18)",
                background: "#faf8f4", fontSize: "13px", color: "#1a1710", outline: "none",
              }}
            >
              <option value="meat-os">Meat OS (500 credits/mo)</option>
              <option value="agency-os">Agency OS (2,000 credits/mo)</option>
              <option value="marketplace-os">Marketplace OS (5,000 credits/mo)</option>
            </select>
            <button
              onClick={() => createClientMut.mutate(newClient)}
              disabled={!newClient.name || !newClient.email}
              style={{
                padding: "8px 16px", background: GOLD, color: "#ffffff",
                border: "none", fontSize: "11px", letterSpacing: "2px",
                textTransform: "uppercase", cursor: "pointer",
                opacity: !newClient.name || !newClient.email ? 0.5 : 1,
              }}
            >
              Create
            </button>
            <button
              onClick={() => setShowAddClient(false)}
              style={{
                padding: "8px 16px", background: "transparent",
                border: "1px solid rgba(166,138,46,0.18)", color: GOLD_DIM,
                fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Client Selector */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {clientsList.map((client) => (
          <button
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 16px",
              background: selectedClientId === client.id ? "rgba(166,138,46,0.08)" : "#ffffff",
              border: `1px solid ${selectedClientId === client.id ? GOLD : "rgba(166,138,46,0.15)"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <Users size={12} style={{ color: GOLD }} />
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#1a1710" }}>{client.name}</p>
              <p style={{ fontSize: "10px", color: GOLD_DIM }}>{TIER_LABELS[client.tier] || client.tier}</p>
            </div>
            <span
              style={{
                fontFamily: "'Menlo', monospace", fontSize: "12px",
                fontWeight: 700, color: GOLD, marginLeft: "8px",
              }}
            >
              {client.aiCredits.toLocaleString()}
            </span>
          </button>
        ))}
        {clientsList.length === 0 && (
          <p style={{ fontSize: "13px", color: GOLD_DIM, padding: "20px" }}>
            No clients yet. Click "Add Client" to get started.
          </p>
        )}
      </div>

      {/* Credit Dashboard */}
      {creditData && activeClient && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          {/* Balance Card */}
          <div
            style={{
              background: "#ffffff", border: "1px solid rgba(166,138,46,0.18)",
              padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: GOLD_DIM }}>
              Credit Balance
            </p>
            <p style={{
              fontFamily: "'Menlo', monospace", fontSize: "32px",
              fontWeight: 700, color: "#1a1710", marginTop: "8px",
            }}>
              {creditData.balance.toLocaleString()}
            </p>
            <p style={{ fontSize: "11px", color: GOLD_DIM, marginTop: "4px" }}>
              of {creditData.monthlyAllocation.toLocaleString()} monthly
            </p>
            <div
              style={{
                marginTop: "12px", height: "4px", background: "rgba(166,138,46,0.1)",
                borderRadius: "2px", overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min((creditData.balance / Math.max(creditData.monthlyAllocation, 1)) * 100, 100)}%`,
                  background: GOLD,
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>

          {/* Tier Card */}
          <div
            style={{
              background: "#ffffff", border: "1px solid rgba(166,138,46,0.18)",
              padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: GOLD_DIM }}>
              Current Tier
            </p>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "22px", fontWeight: 600, color: "#1a1710", marginTop: "8px",
            }}>
              {TIER_LABELS[creditData.tier] || creditData.tier}
            </p>
            <p style={{ fontSize: "12px", color: GOLD_DIM, marginTop: "4px" }}>
              {TIER_PRICES[creditData.tier] || "Custom"}
            </p>
            <p style={{ fontSize: "11px", color: GOLD, marginTop: "8px" }}>
              <Zap size={10} style={{ display: "inline", verticalAlign: "middle" }} /> {creditData.monthlyAllocation.toLocaleString()} credits/month included
            </p>
          </div>

          {/* Usage Stats */}
          <div
            style={{
              background: "#ffffff", border: "1px solid rgba(166,138,46,0.18)",
              padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: GOLD_DIM }}>
              Recent Usage
            </p>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {(() => {
                const usageTxs = creditData.transactions.filter((t) => t.type === "usage");
                const totalUsed = usageTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                const purchaseTxs = creditData.transactions.filter((t) => t.type === "purchase");
                const totalPurchased = purchaseTxs.reduce((sum, t) => sum + t.amount, 0);
                return (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: GOLD_DIM }}>Used (total)</span>
                      <span style={{ fontFamily: "'Menlo', monospace", fontSize: "12px", color: "#c14e3c", fontWeight: 600 }}>
                        -{totalUsed.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: GOLD_DIM }}>Purchased</span>
                      <span style={{ fontFamily: "'Menlo', monospace", fontSize: "12px", color: "#2d8a3e", fontWeight: 600 }}>
                        +{totalPurchased.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: GOLD_DIM }}>Transactions</span>
                      <span style={{ fontFamily: "'Menlo', monospace", fontSize: "12px", color: "#1a1710" }}>
                        {creditData.transactions.length}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Buy Credits */}
      {selectedClientId && creditData && (
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: GOLD, marginBottom: "12px" }}>
            Top Up Credits
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {CREDIT_PACKAGES.map((pkg) => (
              <button
                key={pkg.credits}
                onClick={() =>
                  purchaseMut.mutate({
                    amount: pkg.credits,
                    description: `Top-up: ${pkg.credits} credits (${pkg.price})`,
                  })
                }
                disabled={purchaseMut.isPending}
                style={{
                  background: "#ffffff", border: "1px solid rgba(166,138,46,0.18)",
                  padding: "16px", cursor: "pointer", transition: "all 0.15s",
                  textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <p style={{ fontFamily: "'Menlo', monospace", fontSize: "20px", fontWeight: 700, color: "#1a1710" }}>
                  {pkg.credits.toLocaleString()}
                </p>
                <p style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: GOLD_DIM, marginTop: "4px" }}>
                  credits
                </p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: GOLD, marginTop: "8px" }}>
                  {pkg.price}
                </p>
              </button>
            ))}
          </div>
          <p style={{ fontSize: "10px", color: GOLD_DIM, marginTop: "8px" }}>
            PayFast integration — payments auto-credit via webhook (merchant ID: 12946117)
          </p>
        </div>
      )}

      {/* Transaction History */}
      {creditData && creditData.transactions.length > 0 && (
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: GOLD, marginBottom: "12px" }}>
            Transaction History
          </p>
          <div
            style={{
              background: "#ffffff", border: "1px solid rgba(166,138,46,0.18)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(166,138,46,0.12)" }}>
                  {["Date", "Type", "Description", "Amount", "Balance"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px", textAlign: "left",
                        fontSize: "9px", letterSpacing: "2px",
                        textTransform: "uppercase", color: GOLD_DIM,
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {creditData.transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid rgba(166,138,46,0.06)" }}>
                    <td style={{ padding: "10px 12px", fontSize: "12px", fontFamily: "'Menlo', monospace", color: GOLD_DIM }}>
                      {new Date(tx.createdAt).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase",
                          padding: "2px 8px",
                          background: tx.amount >= 0 ? "rgba(45,138,62,0.08)" : "rgba(193,78,60,0.08)",
                          color: tx.amount >= 0 ? "#2d8a3e" : "#c14e3c",
                        }}
                      >
                        {tx.amount >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "#1a1710" }}>
                      {tx.description || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px", fontFamily: "'Menlo', monospace",
                        fontSize: "12px", fontWeight: 600,
                        color: tx.amount >= 0 ? "#2d8a3e" : "#c14e3c",
                      }}
                    >
                      {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px", fontFamily: "'Menlo', monospace",
                        fontSize: "12px", color: "#1a1710",
                      }}
                    >
                      {tx.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credit Costs Reference */}
      <div>
        <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: GOLD, marginBottom: "12px" }}>
          Credit Costs per AI Action
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {[
            { label: "GPT-4o Caption", cost: 5, icon: "Aa" },
            { label: "Higgsfield Image", cost: 10, icon: "Img" },
            { label: "Higgsfield Video", cost: 25, icon: "Vid" },
            { label: "Chat (GPT-4o)", cost: 3, icon: "Chat" },
            { label: "Chat (Claude)", cost: 4, icon: "Chat" },
            { label: "Chat (Gemini)", cost: 2, icon: "Chat" },
            { label: "Chat (Perplexity)", cost: 2, icon: "Chat" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#ffffff", border: "1px solid rgba(166,138,46,0.12)",
                padding: "12px", display: "flex", justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "11px", color: "#1a1710" }}>{item.label}</span>
              <span style={{ fontFamily: "'Menlo', monospace", fontSize: "12px", fontWeight: 700, color: GOLD }}>
                {item.cost}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
