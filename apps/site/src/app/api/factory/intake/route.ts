import { NextRequest, NextResponse } from "next/server";
import { addProject } from "@/lib/store";
import { SERVICE_CATALOG } from "@/lib/services-data";
import type { FactoryProject } from "@/lib/services-data";
import { createClientAccessToken, hashClientAccessToken, publicProject } from "@/lib/access";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clientName, clientEmail, serviceId, title, description, transcription, links } = body;

  if (!clientName || !clientEmail || !serviceId || !title) {
    return NextResponse.json(
      { error: "Missing required fields: clientName, clientEmail, serviceId, title" },
      { status: 400 }
    );
  }

  if (
    typeof clientName !== "string" ||
    typeof clientEmail !== "string" ||
    typeof serviceId !== "string" ||
    typeof title !== "string" ||
    clientName.length > 120 ||
    clientEmail.length > 254 ||
    title.length > 200 ||
    !/^\S+@\S+\.\S+$/.test(clientEmail)
  ) {
    return NextResponse.json({ error: "Invalid project details" }, { status: 400 });
  }

  const service = SERVICE_CATALOG.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
  }

  const slug = `DF-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString();
  const accessToken = createClientAccessToken();

  const project: FactoryProject = {
    id: slug,
    slug,
    clientName,
    clientEmail,
    serviceId,
    title,
    description: description || transcription || "",
    status: "intake",
    tier: service.tier,
    quotedPriceUsd: service.startingPriceUsd,
    depositPaid: false,
    buildPaid: false,
    finalPaid: false,
    voiceNoteUrl: null,
    transcription: transcription || null,
    attachments: [],
    links: links || [],
    linearIssueId: null,
    githubRepo: null,
    reviewRound: 0,
    maxReviews: service.tier === "custom" ? 99 : 3,
    agentNotes: "",
    clientAccessTokenHash: hashClientAccessToken(accessToken),
    processedPaymentIds: [],
    createdAt: now,
    updatedAt: now,
  };

  const created = await addProject(project);
  return NextResponse.json({ project: publicProject(created), accessToken }, { status: 201 });
}
