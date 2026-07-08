import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { createStageInvoice, stageAmounts, isConnected } from "@/lib/quickbooks";

export const dynamic = "force-dynamic";

// GET -> connection status
export async function GET() {
  try {
    return NextResponse.json({ connected: await isConnected() });
  } catch {
    return NextResponse.json({ connected: false });
  }
}

// POST { projectId, stage } -> create a QuickBooks invoice for that stage
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, stage } = body as {
    projectId?: string;
    stage?: "deposit" | "build" | "final";
  };

  if (!projectId || !stage || !["deposit", "build", "final"].includes(stage)) {
    return NextResponse.json(
      { error: "Provide projectId and stage (deposit|build|final)" },
      { status: 400 }
    );
  }

  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (!project.quotedPriceUsd) {
    return NextResponse.json(
      { error: "Project has no quoted price — cannot invoice" },
      { status: 400 }
    );
  }

  try {
    const amount = stageAmounts(project.quotedPriceUsd)[stage];
    const result = await createStageInvoice({
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      projectTitle: project.title,
      stage,
      amountUsd: amount,
    });
    return NextResponse.json({ ok: true, stage, amountUsd: amount, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invoice creation failed" },
      { status: 500 }
    );
  }
}
