export type FactoryService = {
  id: string;
  title: string;
  description: string;
  tier: string;
  startingPriceUsd: number | null;
  turnaround: string;
  features: string[];
  isActive: boolean;
};

export type FactoryProject = {
  id: string;
  slug: string;
  clientName: string;
  clientEmail: string;
  serviceId: string;
  title: string;
  description: string;
  status: string;
  tier: string;
  quotedPriceUsd: number | null;
  depositPaid: boolean;
  buildPaid: boolean;
  finalPaid: boolean;
  voiceNoteUrl: string | null;
  transcription: string | null;
  attachments: string[];
  links: string[];
  linearIssueId: string | null;
  githubRepo: string | null;
  reviewRound: number;
  maxReviews: number;
  agentNotes: string;
  createdAt: string;
  updatedAt: string;
};

// Aligned with apps/engine/factory/config/services.json so site and engine
// agree on service IDs and starting prices.
export const SERVICE_CATALOG: FactoryService[] = [
  {
    id: "lead-list",
    title: "Lead Generation List",
    description: "Curated lead list for outreach and sales campaigns.",
    tier: "lead-list",
    startingPriceUsd: 15,
    turnaround: "24-48 hours",
    features: [
      "Targeted lead research",
      "Delivered as CSV or sheet",
      "1 review round included",
    ],
    isActive: true,
  },
  {
    id: "seo-audit",
    title: "SEO Audit Report",
    description: "Technical and content SEO audit with actionable recommendations.",
    tier: "seo-audit",
    startingPriceUsd: 29,
    turnaround: "24-48 hours",
    features: [
      "Technical SEO scan",
      "Content gap analysis",
      "Prioritized action items",
      "1 review round included",
    ],
    isActive: true,
  },
  {
    id: "landing-page",
    title: "Landing Page Copy + HTML",
    description: "Conversion-focused landing page copy with basic HTML structure.",
    tier: "landing-page",
    startingPriceUsd: 39,
    turnaround: "3-5 days",
    features: [
      "Copywriting + HTML skeleton",
      "Responsive layout guidance",
      "2 review rounds included",
    ],
    isActive: true,
  },
  {
    id: "competitor-analysis",
    title: "Competitor Analysis",
    description: "Deep dive into competitor positioning, features, and gaps.",
    tier: "competitor-analysis",
    startingPriceUsd: 49,
    turnaround: "3-5 days",
    features: [
      "Competitor landscape mapping",
      "Feature and pricing comparison",
      "Strategic recommendations",
      "2 review rounds included",
    ],
    isActive: true,
  },
  {
    id: "small-code-fix",
    title: "Small GitHub Code Fix",
    description: "Focused bug fixes, small features, or tweaks to existing codebases.",
    tier: "small-code-fix",
    startingPriceUsd: 75,
    turnaround: "24-48 hours",
    features: [
      "Single bug fix or small change",
      "Code review via CodeRabbit",
      "1 review round included",
      "Delivered as a PR to your repo",
    ],
    isActive: true,
  },
  {
    id: "mvp-scope",
    title: "MVP Scope From Client Request",
    description: "Scoped MVP blueprint from your requirements and constraints.",
    tier: "mvp-scope",
    startingPriceUsd: 99,
    turnaround: "1-2 weeks",
    features: [
      "Requirements distillation",
      "Feature prioritization",
      "Technical approach document",
      "2 review rounds included",
    ],
    isActive: true,
  },
  {
    id: "custom",
    title: "Custom Project",
    description: "Enterprise solutions, complex integrations, or unique requirements.",
    tier: "custom",
    startingPriceUsd: null,
    turnaround: "Custom timeline",
    features: [
      "Tailored to your exact requirements",
      "Dedicated agent team",
      "Architecture planning included",
      "Unlimited review rounds",
      "Priority support",
      "Custom deployment strategy",
    ],
    isActive: true,
  },
];
