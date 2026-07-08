import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAuthorizeUrl } from "@/lib/quickbooks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = randomBytes(16).toString("hex");
    const url = getAuthorizeUrl(state);
    const res = NextResponse.redirect(url);
    res.cookies.set("qb_oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start QuickBooks OAuth" },
      { status: 500 }
    );
  }
}
