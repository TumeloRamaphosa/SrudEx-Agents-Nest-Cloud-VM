import { NextRequest, NextResponse } from "next/server";
import { validateItn } from "@/lib/payfast";
import { getProject, updateProjectPayment, updateProjectStatus } from "@/lib/store";
import { createStageInvoice, stageAmounts, isConnected } from "@/lib/quickbooks";
import { sendEmail, invoiceEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  deposit: "10% Plan Deposit",
  build: "40% Build Payment",
  final: "50% Final Delivery",
};

// Advance the pipeline once a stage is paid.
const NEXT_STATUS: Record<string, string> = {
  deposit: "approved",
  build: "building",
  final: "delivered",
};

/**
 * PayFast ITN (Instant Transaction Notification) webhook.
 * PayFast POSTs application/x-www-form-urlencoded. We must always return 200
 * quickly so PayFast doesn't retry; fulfilment errors are logged, not thrown.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = typeof v === "string" ? v : "";

  const check = await validateItn(params);
  if (!check.valid) {
    console.error("[payfast] ITN rejected:", check.reason);
    // Still 200 so PayFast stops retrying an invalid/forged request.
    return new NextResponse("OK", { status: 200 });
  }

  const paymentStatus = params.payment_status;
  const projectId = params.custom_str1;
  const stage = params.custom_str2 as "deposit" | "build" | "final" | undefined;

  if (paymentStatus !== "COMPLETE" || !projectId || !stage) {
    return new NextResponse("OK", { status: 200 });
  }

  try {
    const project = await getProject(projectId);
    if (!project) {
      console.error("[payfast] project not found for ITN:", projectId);
      return new NextResponse("OK", { status: 200 });
    }

    // 1. Mark the stage paid + advance the pipeline.
    await updateProjectPayment(projectId, stage);
    if (NEXT_STATUS[stage]) await updateProjectStatus(projectId, NEXT_STATUS[stage]);

    // 2. Create a QuickBooks invoice (if connected).
    let invoiceNumber: string | undefined;
    if (project.quotedPriceUsd && (await isConnected())) {
      try {
        const amount = stageAmounts(project.quotedPriceUsd)[stage];
        const inv = await createStageInvoice({
          clientName: project.clientName,
          clientEmail: project.clientEmail,
          projectTitle: project.title,
          stage,
          amountUsd: amount,
        });
        invoiceNumber = inv.docNumber;
      } catch (err) {
        console.error("[payfast] QuickBooks invoice failed:", err);
      }
    }

    // 3. Email the client a receipt via AgentMail.
    try {
      const amountZar = Number(params.amount_gross || params.amount || "0");
      await sendEmail({
        to: project.clientEmail,
        subject: `Payment received — ${STAGE_LABEL[stage]} · ${project.title}`,
        html: invoiceEmailHtml({
          clientName: project.clientName,
          projectTitle: project.title,
          stageLabel: STAGE_LABEL[stage],
          amountZar,
          invoiceNumber,
        }),
      });
    } catch (err) {
      console.error("[payfast] receipt email failed:", err);
    }
  } catch (err) {
    console.error("[payfast] ITN fulfilment error:", err);
  }

  return new NextResponse("OK", { status: 200 });
}
