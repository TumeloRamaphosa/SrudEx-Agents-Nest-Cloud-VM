const encoder = new TextEncoder();
const webCrypto = (globalThis as unknown as { crypto: Crypto }).crypto;

type BinaryValue = string | Uint8Array;

function toBase64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toBytes(value: BinaryValue): Uint8Array {
  return typeof value === "string" ? encoder.encode(value) : value;
}

export function constantTimeEqual(a: BinaryValue, b: BinaryValue): boolean {
  const left = toBytes(a);
  const right = toBytes(b);
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index++) {
    difference |= (left[index] || 0) ^ (right[index] || 0);
  }

  return difference === 0;
}

async function sign(payload: string, secret: string): Promise<Uint8Array> {
  const key = await webCrypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await webCrypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export async function createToken(
  payload: { username: string },
  secret: string,
  ttlSeconds = 86400,
): Promise<string> {
  const encodedPayload = toBase64Url(
    encoder.encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })),
  );
  const signature = await sign(encodedPayload, secret);
  return `${encodedPayload}.${toBase64Url(signature)}`;
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<{ username: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedPayload, encodedSignature] = parts;
    if (!encodedPayload || !encodedSignature) return null;

    const expectedSignature = await sign(encodedPayload, secret);
    if (!constantTimeEqual(expectedSignature, fromBase64Url(encodedSignature))) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))) as {
      username?: unknown;
      exp?: unknown;
    };
    if (
      typeof payload.username !== "string" ||
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp)
    ) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

    return { username: payload.username };
  } catch {
    return null;
  }
}
