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
  clientAccessTokenHash?: string;
  processedPaymentIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export const SERVICE_CATALOG: FactoryService[] = [
  {
    id: "quick-fix",
    title: "Quick Fix",
    description: "Bug fixes, small changes, and tweaks to existing codebases.",
    tier: "quick-fix",
    startingPriceUsd: 150,
    turnaround: "24-48 hours",
    features: [
      "Single bug fix or small feature change",
      "Code review via CodeRabbit",
      "1 review round included",
      "Delivered as a PR to your repo",
    ],
    isActive: true,
  },
  {
    id: "micro-build",
    title: "Micro Build",
    description: "Landing pages, single features, API endpoints, or integrations.",
    tier: "micro-build",
    startingPriceUsd: 500,
    turnaround: "3-5 days",
    features: [
      "Single-page site or feature module",
      "Responsive design included",
      "API integration (1-2 endpoints)",
      "2 review rounds included",
      "Deployed to your hosting",
    ],
    isActive: true,
  },
  {
    id: "mini-project",
    title: "Mini Project",
    description: "Multi-page sites, dashboards, API services, or data pipelines.",
    tier: "mini-project",
    startingPriceUsd: 1500,
    turnaround: "1-2 weeks",
    features: [
      "Multi-page application or service",
      "Database design and setup",
      "Authentication and authorization",
      "CI/CD pipeline configuration",
      "3 review rounds included",
      "Documentation included",
    ],
    isActive: true,
  },
  {
    id: "mvp-build",
    title: "MVP Build",
    description: "Full application MVPs with frontend, backend, database, and deployment.",
    tier: "mvp-build",
    startingPriceUsd: 5000,
    turnaround: "2-4 weeks",
    features: [
      "Full-stack application",
      "User authentication system",
      "Admin dashboard",
      "Payment integration ready",
      "Mobile-responsive design",
      "3 review rounds included",
      "Deployment and hosting setup",
      "30-day post-launch support",
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
