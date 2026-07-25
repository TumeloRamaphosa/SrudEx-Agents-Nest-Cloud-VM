/**
 * Thin wrapper over the Upstash/Vercel KV REST API with an in-memory fallback
 * for local dev. On Vercel, KV_REST_API_URL + KV_REST_API_TOKEN are injected by
 * the Upstash marketplace integration.
 */

export function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function isProduction(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

function requireKvInProduction(): void {
  if (!kvConfigured() && isProduction()) {
    throw new Error(
      "KV is required in production. Set KV_REST_API_URL and KV_REST_API_TOKEN."
    );
  }
}

// In-memory fallback (local dev only — not durable on serverless).
const memory = new Map<string, string>();

export async function kvGetRaw(key: string): Promise<string | null> {
  requireKvInProduction();
  if (!kvConfigured()) return memory.get(key) ?? null;
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { result: string | null };
  return body.result ?? null;
}

export async function kvSetRaw(key: string, value: string): Promise<void> {
  requireKvInProduction();
  if (!kvConfigured()) {
    memory.set(key, value);
    return;
  }
  // Upstash REST stores the raw request body as the value — do NOT re-encode,
  // `value` is already the exact string we want persisted.
  await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "text/plain",
    },
    body: value,
  });
}

export async function kvGetJson<T>(key: string): Promise<T | null> {
  const raw = await kvGetRaw(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function kvSetJson<T>(key: string, value: T): Promise<void> {
  await kvSetRaw(key, JSON.stringify(value));
}
