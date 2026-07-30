/**
 * Persistence for QuickBooks OAuth tokens.
 *
 * QuickBooks rotates the refresh token on every refresh, so tokens MUST be
 * stored durably. Backed by Vercel KV (Upstash) in production; falls back to
 * an in-memory value for local dev via the shared kv helper.
 */

import { kvGetJson, kvSetJson } from "./kv";

export type QuickBooksToken = {
  accessToken: string;
  refreshToken: string;
  realmId: string;
  /** epoch ms when the access token expires */
  expiresAt: number;
};

const KV_KEY = "quickbooks:token";

export async function getToken(): Promise<QuickBooksToken | null> {
  return kvGetJson<QuickBooksToken>(KV_KEY);
}

export async function setToken(token: QuickBooksToken): Promise<void> {
  await kvSetJson(KV_KEY, token);
}
