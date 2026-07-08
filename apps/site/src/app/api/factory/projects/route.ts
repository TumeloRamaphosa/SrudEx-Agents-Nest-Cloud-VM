import { NextRequest, NextResponse } from "next/server";
import { getProjects, updateProjectStatus, updateProjectPayment } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getProjects());
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status, paymentStage } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  if (status) {
    const updated = await updateProjectStatus(id, status);
    if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  if (paymentStage) {
    const updated = await updateProjectPayment(id, paymentStage);
    if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "No update specified" }, { status: 400 });
}
