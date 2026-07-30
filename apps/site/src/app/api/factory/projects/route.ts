import { NextRequest, NextResponse } from "next/server";
import { getProject, getProjects, updateProjectStatus, updateProjectPayment } from "@/lib/store";
import { canAccessProject, isAdminRequest, publicProject } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (isAdminRequest(request)) {
    return NextResponse.json((await getProjects()).map(publicProject));
  }

  const id = request.nextUrl.searchParams.get("id");
  const token = request.headers.get("x-project-access-token");
  if (!id || !token) {
    return NextResponse.json({ error: "Project access token required" }, { status: 401 });
  }

  const project = await getProject(id);
  if (!project || !canAccessProject(project, token)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(publicProject(project));
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin authorization required" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status, paymentStage } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  if (status) {
    const updated = await updateProjectStatus(id, status);
    if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(publicProject(updated));
  }

  if (paymentStage) {
    if (!["deposit", "build", "final"].includes(paymentStage)) {
      return NextResponse.json({ error: "Invalid payment stage" }, { status: 400 });
    }
    const updated = await updateProjectPayment(id, paymentStage);
    if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(publicProject(updated));
  }

  return NextResponse.json({ error: "No update specified" }, { status: 400 });
}
