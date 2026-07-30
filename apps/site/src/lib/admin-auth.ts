import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function readBearerToken(header: string | null): string {
  if (!header || !header.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
}

/**
 * Verifies that the request presents the admin bearer token configured in
 * DARK_FACTORY_ADMIN_TOKEN. Returns a NextResponse to short-circuit the route
 * on failure, or null when the caller is authorized.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  const expected = process.env.DARK_FACTORY_ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "Admin auth is not configured" },
      { status: 503 }
    );
  }

  const presented = readBearerToken(request.headers.get("Authorization"));
  if (presented.length !== expected.length) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const a = Buffer.from(presented);
    const b = Buffer.from(expected);
    if (!timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
