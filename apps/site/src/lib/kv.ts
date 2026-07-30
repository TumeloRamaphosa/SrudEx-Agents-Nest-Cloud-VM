/**
 * Thin wrapper over the Upstash/Vercel KV REST API with an in-memory fallback
 * for local dev. On Vercel, KV_REST_API_URL + KV_REST_API_TOKEN are injected by
 * the Upstash marketplace integration.
 */

export function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function assertDurableStorage(): void {
  if (
    (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") &&
    !kvConfigured()
  ) {
    throw new Error("KV is required in production. Set KV_REST_API_URL and KV_REST_API_TOKEN.");
  }
}
// In-memory fallback (local dev only — not durable on serverless).
const memory = new Map<string, string>();

export async function kvGetRaw(key: string): Promise<string | null> {
  assertDurableStorage();
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
  assertDurableStorage();
  if (!kvConfigured()) {
    memory.set(key, value);
    return;
  }
  // Upstash REST stores the raw request body as the value — do NOT re-encode,
  // `value` is already the exact string we want persisted.
  const response = await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "text/plain",
    },
    body: value,
  });
  if (!response.ok) throw new Error(`KV SET failed: ${response.status}`);
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

export async function kvSetIfAbsent(key: string, value: string): Promise<boolean> {
  assertDurableStorage();
  if (!kvConfigured()) {
    if (memory.has(key)) return false;
    memory.set(key, value);
    return true;
  }

  const response = await fetch(process.env.KV_REST_API_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SET", key, value, "NX"]),
  });
  if (!response.ok) throw new Error(`KV SET NX failed: ${response.status}`);
  const payload = (await response.json()) as { result: "OK" | null };
  return payload.result === "OK";
}

export async function kvDelete(key: string): Promise<void> {
  assertDurableStorage();
  if (!kvConfigured()) {
    memory.delete(key);
    return;
  }

  const response = await fetch(process.env.KV_REST_API_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["DEL", key]),
  });
  if (!response.ok) throw new Error(`KV DEL failed: ${response.status}`);
}

export async function kvSetAdd(key: string, value: string): Promise<void> {
  assertDurableStorage();
  if (!kvConfigured()) {
    const members = new Set(JSON.parse(memory.get(key) || "[]") as string[]);
    members.add(value);
    memory.set(key, JSON.stringify([...members]));
    return;
  }

  const response = await fetch(process.env.KV_REST_API_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SADD", key, value]),
  });
  if (!response.ok) throw new Error(`KV SADD failed: ${response.status}`);
}

export async function kvSetMembers(key: string): Promise<string[]> {
  assertDurableStorage();
  if (!kvConfigured()) {
    return JSON.parse(memory.get(key) || "[]") as string[];
  }

  const response = await fetch(process.env.KV_REST_API_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SMEMBERS", key]),
  });
  if (!response.ok) throw new Error(`KV SMEMBERS failed: ${response.status}`);
  const payload = (await response.json()) as { result: string[] | null };
  return payload.result ?? [];
}
