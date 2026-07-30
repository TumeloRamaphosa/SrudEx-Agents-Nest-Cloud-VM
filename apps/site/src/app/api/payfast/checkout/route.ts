import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { buildCheckout, usdToZar } from "@/lib/payfast";
import { stageAmounts } from "@/lib/quickbooks";
import { canAccessProject } from "@/lib/access";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  deposit: "10% Plan Deposit",
  build: "40% Build Payment",
  final: "50% Final Delivery",
};

// POST { projectId, stage } -> { url } redirect to PayFast checkout
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, stage, accessToken } = body as {
    projectId?: string;
    stage?: "deposit" | "build" | "final";
    accessToken?: string;
  };

  if (!projectId || !stage || !["deposit", "build", "final"].includes(stage)) {
    return NextResponse.json(
      { error: "Provide projectId and stage (deposit|build|final)" },
      { status: 400 }
    );
  }

  const project = await getProject(projectId);
  if (!project || !accessToken || !canAccessProject(project, accessToken)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (!project.quotedPriceUsd) {
    return NextResponse.json({ error: "Project has no quoted price" }, { status: 400 });
  }

  const unavailable =
    (stage === "deposit" && project.depositPaid) ||
    (stage === "build" && (!project.depositPaid || project.buildPaid)) ||
    (stage === "final" && (!project.buildPaid || project.finalPaid));
  if (unavailable) {
    return NextResponse.json({ error: "Payment stage is not available" }, { status: 409 });
  }

  const amountUsd = stageAmounts(project.quotedPriceUsd)[stage];
  const amountZar = usdToZar(amountUsd);

  const { url } = buildCheckout({
    paymentId: `${project.id}:${stage}`,
    amountZar,
    itemName: `${project.title} — ${STAGE_LABEL[stage]}`,
    itemDescription: `Dark Factory ${STAGE_LABEL[stage]} for project ${project.slug}`,
    clientName: project.clientName,
    clientEmail: project.clientEmail,
    customStr1: project.id,
    customStr2: stage,
  });

  return NextResponse.json({ url, amountZar, amountUsd, stage });
}
