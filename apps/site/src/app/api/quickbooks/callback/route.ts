import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/quickbooks";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const realmId = searchParams.get("realmId");
  const state = searchParams.get("state");
  const cookieState = req.cookies.get("qb_oauth_state")?.value;

  if (searchParams.get("error")) {
    return NextResponse.json({ error: searchParams.get("error") }, { status: 400 });
  }
  if (!code || !realmId) {
    return NextResponse.json({ error: "Missing code or realmId" }, { status: 400 });
  }
  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }

  try {
    await exchangeCode(code, realmId);
    return new NextResponse(
      `<html><body style="font-family:sans-serif;background:#0a0a0a;color:#f5ecd0;padding:40px">
        <h1 style="color:#4CFFA8">QuickBooks connected ✓</h1>
        <p>Dark Factory can now create staged invoices. You can close this window.</p>
      </body></html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Token exchange failed" },
      { status: 500 }
    );
  }
}
