/**
 * PayFast integration (South African payment gateway, ZAR).
 * https://developers.payfast.co.za/docs
 *
 * Flow (Option 1 — staged one-off payments):
 *  1. POST /api/payfast/checkout { projectId, stage } -> returns a signed redirect URL
 *  2. Client pays on PayFast
 *  3. PayFast POSTs an ITN to /api/payfast/notify -> we verify + fulfil
 *
 * Env vars:
 *  - PAYFAST_MERCHANT_ID       (sandbox default 10000100)
 *  - PAYFAST_MERCHANT_KEY      (sandbox default 46f0cd694581a)
 *  - PAYFAST_PASSPHRASE        (optional; set the same value in the PayFast dashboard)
 *  - PAYFAST_ENV               ("sandbox" | "live", default "sandbox")
 *  - PAYFAST_RETURN_URL / PAYFAST_CANCEL_URL / PAYFAST_NOTIFY_URL (optional overrides)
 *  - USD_TO_ZAR                (conversion rate for USD-quoted prices; required in production, fallback 18.5 in dev)
 */

import { createHash } from "crypto";

const PF_ENV = process.env.PAYFAST_ENV === "live" ? "live" : "sandbox";

const HOSTS = {
  process:
    PF_ENV === "live"
      ? "https://www.payfast.co.za/eng/process"
      : "https://sandbox.payfast.co.za/eng/process",
  validate:
    PF_ENV === "live"
      ? "https://www.payfast.co.za/eng/query/validate"
      : "https://sandbox.payfast.co.za/eng/query/validate",
};

// PayFast sandbox defaults so the flow works with zero credentials.
function merchantId(): string {
  return process.env.PAYFAST_MERCHANT_ID || "10000100";
}
function merchantKey(): string {
  return process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a";
}
function passphrase(): string | null {
  const p = process.env.PAYFAST_PASSPHRASE;
  return p && p.length > 0 ? p : null;
}

const SITE = process.env.PAYFAST_SITE_URL || "https://factory.studex-group.com";

function urlBase(): { returnUrl: string; cancelUrl: string; notifyUrl: string } {
  return {
    returnUrl: process.env.PAYFAST_RETURN_URL || `${SITE}/?payment=success`,
    cancelUrl: process.env.PAYFAST_CANCEL_URL || `${SITE}/?payment=cancelled`,
    notifyUrl: process.env.PAYFAST_NOTIFY_URL || `${SITE}/api/payfast/notify`,
  };
}

/** PayFast-style URL encoding: encodeURIComponent, spaces as '+', uppercase hex. */
function pfEncode(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/**
 * Build the MD5 signature over an ordered list of [key, value] pairs.
 * Order matters — PayFast signs fields in the order they are sent.
 */
export function signature(
  pairs: Array<[string, string]>,
  opts: { includeEmpty?: boolean } = {}
): string {
  const parts = pairs
    .filter(([, v]) => opts.includeEmpty || (v !== "" && v !== undefined && v !== null))
    .map(([k, v]) => `${k}=${pfEncode(v)}`);
  let base = parts.join("&");
  const pass = passphrase();
  if (pass) base += `&passphrase=${pfEncode(pass)}`;
  return createHash("md5").update(base).digest("hex");
}

export function usdToZar(usd: number): number {
  const raw = process.env.USD_TO_ZAR;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("USD_TO_ZAR is required in production. Set it in your environment.");
    }
    console.warn("[payfast] USD_TO_ZAR not set — using fallback rate of 18.5");
  }
  const rate = Number(raw || "18.5");
  return Math.round(usd * rate * 100) / 100;
}

export type CheckoutInput = {
  paymentId: string; // m_payment_id — our own reference (e.g. `${projectId}:${stage}`)
  amountZar: number;
  itemName: string;
  itemDescription?: string;
  clientName?: string;
  clientEmail?: string;
  customStr1?: string; // we stash projectId here
  customStr2?: string; // we stash stage here
};

/**
 * Build the ordered field list + signature and return a redirect URL to PayFast.
 * Field order follows PayFast's recommended sequence.
 */
export function buildCheckout(input: CheckoutInput): { url: string; fields: Record<string, string> } {
  const { returnUrl, cancelUrl, notifyUrl } = urlBase();

  const pairs: Array<[string, string]> = [
    ["merchant_id", merchantId()],
    ["merchant_key", merchantKey()],
    ["return_url", returnUrl],
    ["cancel_url", cancelUrl],
    ["notify_url", notifyUrl],
  ];

  if (input.clientName) {
    const [first, ...rest] = input.clientName.trim().split(" ");
    pairs.push(["name_first", first]);
    if (rest.length) pairs.push(["name_last", rest.join(" ")]);
  }
  if (input.clientEmail) pairs.push(["email_address", input.clientEmail]);

  pairs.push(["m_payment_id", input.paymentId]);
  pairs.push(["amount", input.amountZar.toFixed(2)]);
  pairs.push(["item_name", input.itemName]);
  if (input.itemDescription) pairs.push(["item_description", input.itemDescription]);
  if (input.customStr1) pairs.push(["custom_str1", input.customStr1]);
  if (input.customStr2) pairs.push(["custom_str2", input.customStr2]);

  const sig = signature(pairs);
  const query = pairs
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k}=${pfEncode(v)}`)
    .join("&");

  const fields: Record<string, string> = {};
  for (const [k, v] of pairs) fields[k] = v;
  fields.signature = sig;

  return { url: `${HOSTS.process}?${query}&signature=${sig}`, fields };
}

/**
 * Validate an ITN payload received at the notify_url.
 * Returns true only if signature matches AND PayFast server-side validation passes.
 */
export async function validateItn(
  rawParams: Record<string, string>
): Promise<{ valid: boolean; reason?: string }> {
  // 1. Recompute signature over all fields except `signature`, in received order.
  const received = rawParams.signature;
  const pairs: Array<[string, string]> = Object.entries(rawParams)
    .filter(([k]) => k !== "signature")
    .map(([k, v]) => [k, v] as [string, string]);
  // PayFast signs the ITN over ALL posted fields (including empty ones), in the
  // order received, plus the passphrase — unlike checkout where we only send
  // (and sign) the non-empty fields.
  const expected = signature(pairs, { includeEmpty: true });
  if (!received || received !== expected) {
    return { valid: false, reason: "signature_mismatch" };
  }

  // 2. Server-to-server confirmation with PayFast.
  const body = Object.entries(rawParams)
    .map(([k, v]) => `${k}=${pfEncode(v)}`)
    .join("&");
  const res = await fetch(HOSTS.validate, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = (await res.text()).trim();
  if (!text.startsWith("VALID")) {
    return { valid: false, reason: "payfast_validation_failed" };
  }

  return { valid: true };
}

export function isLive(): boolean {
  return PF_ENV === "live";
}
