import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
import { AnalyticsStrip } from "@/components/AnalyticsStrip";
import ContentQueue from "@/pages/ContentQueue";
import ContentCalendar from "@/pages/ContentCalendar";
import GenerateContent from "@/pages/GenerateContent";
import Analytics from "@/pages/Analytics";
import AgentNetwork from "@/pages/AgentNetwork";
import FacebookAds from "@/pages/FacebookAds";
import DeliveryTeam from "@/pages/DeliveryTeam";
import Communications from "@/pages/Communications";
import ShopifyStore from "@/pages/ShopifyStore";
import GlobalMarkets from "@/pages/GlobalMarkets";
import SuperAgents from "@/pages/SuperAgents";
import Payments from "@/pages/Payments";
import RevenueEngine from "@/pages/RevenueEngine";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { LayoutGrid, Calendar, Sparkles, TrendingUp, ShoppingBag, CheckSquare, Bot, Megaphone, Truck, MessageSquare, Globe, Cpu, CreditCard } from "lucide-react";

const TABS = [
  { id: "queue", label: "Queue", icon: LayoutGrid },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "shopify", label: "Shopify", icon: ShoppingBag },
  { id: "approvals", label: "Approvals", icon: CheckSquare },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "ads", label: "Ads", icon: Megaphone },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "comms", label: "Comms", icon: MessageSquare },
  { id: "global", label: "Global Markets", icon: Globe },
  { id: "super-agents", label: "Super Agents", icon: Cpu },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "revenue", label: "Revenue Engine", icon: TrendingUp },
];

function TabNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (id: string) => void }) {
  return (
    <div
      className="sticky top-[49px] z-40 border-b"
      style={{
        background: "rgba(10,10,12,0.97)",
        borderColor: "rgba(201,168,76,0.15)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-2 px-4 py-3 transition-all whitespace-nowrap shrink-0"
                style={{
                  fontSize: "10px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  fontFamily: "'Helvetica Neue', sans-serif",
                  color: isActive ? "#C9A84C" : "#9a8a5a",
                  borderBottom: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                  background: "transparent",
                }}
                data-testid={`tab-${tab.id}`}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: isActive ? "#C9A84C" : "#9a8a5a" }}
                />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic",
          fontSize: "36px",
          color: "#f5ecd0",
          lineHeight: 1.25,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: "9px",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "#9a8a5a",
        }}
      >
        Coming Soon · Integration In Progress
      </p>
      <div
        style={{
          marginTop: "16px",
          width: "64px",
          height: "1px",
          background: "rgba(201,168,76,0.4)",
        }}
      />
    </div>
  );
}

function MainLayout() {
  const [activeTab, setActiveTab] = useState("queue");

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>
      {/* Sticky analytics strip / war room top bar */}
      <AnalyticsStrip />

      {/* Sticky tab nav */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {activeTab === "queue" && <ContentQueue />}
        {activeTab === "calendar" && <ContentCalendar />}
        {activeTab === "generate" && <GenerateContent />}
        {activeTab === "analytics" && <Analytics />}
        {activeTab === "shopify" && <ShopifyStore />}
        {activeTab === "approvals" && <ComingSoonPage title="Approvals Centre" />}
        {activeTab === "agents" && <AgentNetwork />}
        {activeTab === "ads" && <FacebookAds />}
        {activeTab === "delivery" && <DeliveryTeam />}
        {activeTab === "comms" && <Communications />}
        {activeTab === "global" && <GlobalMarkets />}
        {activeTab === "super-agents" && <SuperAgents />}
        {activeTab === "payments" && <Payments />}
        {activeTab === "revenue" && <RevenueEngine />}
      </main>
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={MainLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivacyProvider>
        <TooltipProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </TooltipProvider>
      </PrivacyProvider>
    </QueryClientProvider>
  );
}

export default App;
