import { NextRequest, NextResponse } from "next/server";
import { usdToZar, validateItn, validateItnDetails } from "@/lib/payfast";
import { getProject, recordProjectPayment } from "@/lib/store";
import { createStageInvoice, stageAmounts, isConnected } from "@/lib/quickbooks";
import { sendEmail, invoiceEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  deposit: "10% Plan Deposit",
  build: "40% Build Payment",
  final: "50% Final Delivery",
};

type PaymentStage = "deposit" | "build" | "final";

function isPaymentStage(value: string | undefined): value is PaymentStage {
  return value === "deposit" || value === "build" || value === "final";
}

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
  const stage = params.custom_str2;
  const payFastPaymentId = params.pf_payment_id;

  if (
    paymentStatus !== "COMPLETE" ||
    !projectId ||
    !isPaymentStage(stage) ||
    !payFastPaymentId
  ) {
    return new NextResponse("OK", { status: 200 });
  }

  try {
    const project = await getProject(projectId);
    if (!project || !project.quotedPriceUsd) {
      console.error("[payfast] project not found or unquoted for ITN:", projectId);
      return new NextResponse("OK", { status: 200 });
    }

    const unavailable =
      (stage === "deposit" && project.depositPaid) ||
      (stage === "build" && (!project.depositPaid || project.buildPaid)) ||
      (stage === "final" && (!project.buildPaid || project.finalPaid));
    if (unavailable) {
      console.error("[payfast] ITN stage is not available", { projectId, stage });
      return new NextResponse("OK", { status: 200 });
    }

    const expectedReference = `${project.id}:${stage}`;
    const expectedAmountZar = usdToZar(stageAmounts(project.quotedPriceUsd)[stage]);
    const details = validateItnDetails(params, {
      paymentId: expectedReference,
      amountZar: expectedAmountZar,
    });
    if (!details.valid) {
      console.error("[payfast] ITN details rejected", {
        projectId,
        stage,
        paymentId: payFastPaymentId,
        reason: details.reason,
      });
      return new NextResponse("OK", { status: 200 });
    }

    // 1. Record exactly-once fulfilment and advance the pipeline.
    const recorded = await recordProjectPayment(projectId, stage, payFastPaymentId);
    if (!recorded.project || recorded.alreadyProcessed) {
      return new NextResponse("OK", { status: 200 });
    }

    // 2. Create a QuickBooks invoice (if connected).
    let invoiceNumber: string | undefined;
    if (await isConnected()) {
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
