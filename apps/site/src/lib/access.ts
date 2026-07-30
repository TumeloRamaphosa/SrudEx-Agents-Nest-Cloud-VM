import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import type { FactoryProject } from "./services-data";

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createClientAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashClientAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function canAccessProject(project: FactoryProject, token: string): boolean {
  if (!project.clientAccessTokenHash || !token) return false;
  return safeEqual(project.clientAccessTokenHash, hashClientAccessToken(token));
}

export const ADMIN_SESSION_COOKIE = "factory_admin_session";

function adminKey(): string | null {
  return process.env.FACTORY_ADMIN_API_KEY || null;
}

export function verifyAdminKey(candidate: string): boolean {
  const expected = adminKey();
  return Boolean(expected && candidate && safeEqual(expected, candidate));
}

export function createAdminSessionToken(): string {
  const key = adminKey();
  if (!key) throw new Error("FACTORY_ADMIN_API_KEY is not configured");
  return createHmac("sha256", key).update("dark-factory-admin-session-v1").digest("base64url");
}

export function isAdminRequest(request: NextRequest): boolean {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ") && verifyAdminKey(authorization.slice("Bearer ".length))) {
    return true;
  }

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!session || !adminKey()) return false;
  return safeEqual(session, createAdminSessionToken());
}

export function publicProject(
  project: FactoryProject
): Omit<FactoryProject, "clientAccessTokenHash" | "processedPaymentIds" | "agentNotes"> {
  const { clientAccessTokenHash, processedPaymentIds, agentNotes, ...visible } = project;
  return visible;
}
