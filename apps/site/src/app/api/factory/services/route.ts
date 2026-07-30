import { NextResponse } from "next/server";
import { SERVICE_CATALOG } from "@/lib/services-data";

export async function GET() {
  const active = SERVICE_CATALOG.filter((s) => s.isActive);
  return NextResponse.json(active);
}
