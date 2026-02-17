import { Redis } from "@upstash/redis";
import crypto from "crypto";

// ── REDIS CLIENT ──────────────────────────────

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// ── TYPES ──────────────────────────────────────

export type AccessType = "subscription" | "daypass" | "single";

export interface AccessRecord {
  type: AccessType;
  createdAt: number;
  expiresAt: number | null; // null = subscription (checked live)
  stripeSessionId: string;
  stripeCustomerId?: string;
}

// ── CODE GENERATION ────────────────────────────

export function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/1/O/0 for clarity
  let code = "MPM-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += "-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── EMAIL HASHING ──────────────────────────────

export function hashEmail(email: string): string {
  const secret = process.env.EMAIL_HASH_SECRET || "mpm_default_hash_secret_change_me";
  return crypto
    .createHmac("sha256", secret)
    .update(email.toLowerCase().trim())
    .digest("hex")
    .slice(0, 32); // 32 chars is plenty for uniqueness
}

// ── TTL CALCULATION ────────────────────────────

function getTtlSeconds(type: AccessType): number {
  switch (type) {
    case "daypass":
      return 86400; // 24 hours
    case "single":
      return 86400; // 1 day max
    case "subscription":
      return 86400 * 35; // 35 days (refreshed on webhook)
    default:
      return 86400;
  }
}

function getExpiresAt(type: AccessType): number | null {
  switch (type) {
    case "daypass":
      return Date.now() + 86400000; // 24h
    case "single":
      return Date.now() + 86400000; // 1 day
    case "subscription":
      return null; // checked live against Stripe
    default:
      return Date.now() + 86400000;
  }
}

// ── SAVE ACCESS ────────────────────────────────

export async function saveEmailAccess(
  email: string,
  type: AccessType,
  stripeSessionId: string,
  stripeCustomerId?: string
): Promise<void> {
  const hash = hashEmail(email);
  const record: AccessRecord = {
    type,
    createdAt: Date.now(),
    expiresAt: getExpiresAt(type),
    stripeSessionId,
    stripeCustomerId,
  };
  await redis.set(`email:${hash}`, JSON.stringify(record), { ex: getTtlSeconds(type) });
}

export async function saveCodeAccess(
  code: string,
  type: AccessType,
  stripeSessionId: string,
  stripeCustomerId?: string
): Promise<void> {
  const record: AccessRecord = {
    type,
    createdAt: Date.now(),
    expiresAt: getExpiresAt(type),
    stripeSessionId,
    stripeCustomerId,
  };
  await redis.set(`code:${code}`, JSON.stringify(record), { ex: getTtlSeconds(type) });
}

// ── VERIFY / RECOVER ACCESS ────────────────────

export async function verifyEmailAccess(email: string): Promise<AccessRecord | null> {
  const hash = hashEmail(email);
  const raw = await redis.get<string>(`email:${hash}`);
  if (!raw) return null;
  const record: AccessRecord = typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as AccessRecord);
  if (record.expiresAt && record.expiresAt < Date.now()) return null;
  return record;
}

export async function verifyCodeAccess(code: string): Promise<AccessRecord | null> {
  const normalized = code.toUpperCase().trim();
  const raw = await redis.get<string>(`code:${normalized}`);
  if (!raw) return null;
  const record: AccessRecord = typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as AccessRecord);
  if (record.expiresAt && record.expiresAt < Date.now()) return null;
  return record;
}

// ── SESSION TEMP STORAGE ───────────────────────
// Webhook stores payment session temporarily so save-access can verify it

export async function savePaymentSession(
  stripeSessionId: string,
  type: AccessType,
  customerId?: string
): Promise<void> {
  await redis.set(
    `session:${stripeSessionId}`,
    JSON.stringify({ type, customerId, createdAt: Date.now() }),
    { ex: 3600 } // 1 hour TTL
  );
}

export async function getPaymentSession(
  stripeSessionId: string
): Promise<{ type: AccessType; customerId?: string } | null> {
  const raw = await redis.get<string>(`session:${stripeSessionId}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as { type: AccessType; customerId?: string });
}

// ── SUBSCRIPTION STATUS ────────────────────────

export async function markSubscriptionCancelled(customerId: string): Promise<void> {
  await redis.set(
    `sub:${customerId}`,
    JSON.stringify({ status: "cancelled", cancelledAt: Date.now() }),
    { ex: 86400 * 7 } // keep for 7 days
  );
}

export async function isSubscriptionCancelled(customerId: string): Promise<boolean> {
  const raw = await redis.get<string>(`sub:${customerId}`);
  if (!raw) return false;
  const data = typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as { status: string });
  return data.status === "cancelled";
}
