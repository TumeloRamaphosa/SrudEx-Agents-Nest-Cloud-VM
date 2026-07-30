import { createHash } from "crypto";

// ---------------------------------------------------------------------------
// Mock next/server so admin-auth.ts and payfast.ts can import it
// ---------------------------------------------------------------------------
class MockNextResponse extends Response {
  static json(body: unknown, init?: ResponseInit) {
    const status = init?.status ?? 200;
    const res = new MockNextResponse(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...(init?.headers as Record<string, string>) },
    });
    return res;
  }
}

jest.mock("next/server", () => ({
  NextResponse: MockNextResponse,
  NextRequest: class extends Request {},
}));

// ---------------------------------------------------------------------------
// requireAdmin tests
// ---------------------------------------------------------------------------
describe("requireAdmin", () => {
  const TOKEN = "test-admin-token-123";

  beforeEach(() => {
    process.env.DARK_FACTORY_ADMIN_TOKEN = TOKEN;
  });

  afterEach(() => {
    delete process.env.DARK_FACTORY_ADMIN_TOKEN;
  });

  async function callRequireAdmin(authHeader?: string) {
    const { requireAdmin } = require("../../site/src/lib/admin-auth");
    const headers: Record<string, string> = {};
    if (authHeader !== undefined) headers.Authorization = authHeader;
    const req = new Request("http://localhost/api/test", { headers });
    return requireAdmin(req);
  }

  it("returns 401 when no Authorization header", async () => {
    const res = await callRequireAdmin(undefined);
    expect(res).not.toBeNull();
    expect((res as Response).status).toBe(401);
  });

  it("returns 401 when token is wrong", async () => {
    const res = await callRequireAdmin("Bearer wrong-token");
    expect(res).not.toBeNull();
    expect((res as Response).status).toBe(401);
  });

  it("returns null when token is correct (200 path)", async () => {
    const res = await callRequireAdmin(`Bearer ${TOKEN}`);
    expect(res).toBeNull();
  });

  it("returns 503 when DARK_FACTORY_ADMIN_TOKEN is not set", async () => {
    delete process.env.DARK_FACTORY_ADMIN_TOKEN;
    const res = await callRequireAdmin(`Bearer anything`);
    expect(res).not.toBeNull();
    expect((res as Response).status).toBe(503);
  });
});

// ---------------------------------------------------------------------------
// KV hard-fail in production
// ---------------------------------------------------------------------------
describe("KV hard-fail in production", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when KV is not configured in production", async () => {
    process.env.NODE_ENV = "production";
    const { kvGetRaw } = await import("../../site/src/lib/kv");
    await expect(kvGetRaw("test-key")).rejects.toThrow("KV is required in production");
  });

  it("does not throw in development without KV", async () => {
    process.env.NODE_ENV = "development";
    const { kvGetRaw } = await import("../../site/src/lib/kv");
    const result = await kvGetRaw("test-key");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// KV route 500 in prod when catch wraps the throw
// ---------------------------------------------------------------------------
describe("KV route handler returns 500 in production", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 500 when KV throws in production", async () => {
    process.env.NODE_ENV = "production";
    const { kvGetRaw } = await import("../../site/src/lib/kv");

    async function routeHandler() {
      try {
        await kvGetRaw("some-key");
        return { status: 200, body: { ok: true } };
      } catch (err: any) {
        return { status: 500, body: { error: err.message } };
      }
    }

    const result = await routeHandler();
    expect(result.status).toBe(500);
    expect(result.body.error).toContain("KV is required in production");
  });
});

// ---------------------------------------------------------------------------
// PayFast ITN — signature verification
// ---------------------------------------------------------------------------
describe("PayFast ITN signature", () => {
  let signatureFn: (pairs: Array<[string, string]>, opts?: { includeEmpty?: boolean }) => string;

  beforeAll(() => {
    jest.resetModules();
    const payfast = require("../../site/src/lib/payfast");
    signatureFn = payfast.signature;
  });

  it("produces a deterministic MD5 signature for a known input", () => {
    const pairs: Array<[string, string]> = [
      ["merchant_id", "10000100"],
      ["merchant_key", "46f0cd694581a"],
      ["amount", "100.00"],
      ["item_name", "Test Item"],
    ];

    const sig1 = signatureFn(pairs);
    const sig2 = signatureFn(pairs);
    expect(sig1).toBe(sig2);
    expect(sig1).toMatch(/^[a-f0-9]{32}$/);
  });

  it("rejects tampered params (different signature)", () => {
    const valid: Array<[string, string]> = [
      ["merchant_id", "10000100"],
      ["amount", "100.00"],
    ];
    const tampered: Array<[string, string]> = [
      ["merchant_id", "10000100"],
      ["amount", "999.00"],
    ];
    expect(signatureFn(valid)).not.toBe(signatureFn(tampered));
  });

  it("includeEmpty signs empty-value fields too", () => {
    const withEmpty: Array<[string, string]> = [
      ["merchant_id", "10000100"],
      ["custom_str1", ""],
    ];

    const sigWith = signatureFn(withEmpty, { includeEmpty: true });
    const sigWithout = signatureFn(withEmpty, { includeEmpty: false });
    expect(sigWith).not.toBe(sigWithout);
  });
});

// ---------------------------------------------------------------------------
// PayFast ITN notify endpoint
// ---------------------------------------------------------------------------
describe("PayFast ITN notify endpoint", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.PAYFAST_ENV = "sandbox";
    process.env.PAYFAST_MERCHANT_ID = "10000100";
    process.env.PAYFAST_MERCHANT_KEY = "46f0cd694581a";
    delete process.env.PAYFAST_PASSPHRASE;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  function buildValidItnFields(): Record<string, string> {
    const { signature: sigFn } = require("../../site/src/lib/payfast");
    const fields: Record<string, string> = {
      merchant_id: "10000100",
      payment_status: "COMPLETE",
      amount_gross: "100.00",
      custom_str1: "proj-123",
      custom_str2: "deposit",
    };
    const pairs: Array<[string, string]> = Object.entries(fields).map(
      ([k, v]) => [k, v] as [string, string]
    );
    fields.signature = sigFn(pairs, { includeEmpty: true });
    return fields;
  }

  it("returns 200 for a validly-signed ITN", async () => {
    const fields = buildValidItnFields();
    global.fetch = jest.fn().mockResolvedValue({ text: () => Promise.resolve("VALID\n") });

    const { validateItn } = require("../../site/src/lib/payfast");
    const result = await validateItn(fields);
    expect(result.valid).toBe(true);
  });

  it("returns invalid for a tampered signature", async () => {
    const fields = buildValidItnFields();
    fields.amount_gross = "99999.00";

    const { validateItn } = require("../../site/src/lib/payfast");
    const result = await validateItn(fields);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("signature_mismatch");
  });

  it("returns invalid when PayFast server rejects", async () => {
    const fields = buildValidItnFields();
    global.fetch = jest.fn().mockResolvedValue({ text: () => Promise.resolve("INVALID\n") });

    const { validateItn } = require("../../site/src/lib/payfast");
    const result = await validateItn(fields);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("payfast_validation_failed");
  });
});
