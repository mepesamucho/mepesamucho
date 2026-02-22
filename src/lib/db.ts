/**
 * db.ts — Vercel Postgres helpers for access_grants table
 *
 * Table: access_grants
 * - id (uuid pk)
 * - stripe_session_id (text unique)
 * - email (text nullable)
 * - code (text unique, format MPM-XXXX-XXXX)
 * - type ('single' | 'monthly')
 * - expires_at (timestamp nullable)
 * - created_at (timestamp default now)
 *
 * Idempotent: ON CONFLICT (stripe_session_id) DO NOTHING
 */

import { sql } from "@vercel/postgres";

// ── CODE GENERATION ──────────────────────────────

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/1/O/0

function generateCode(): string {
  let code = "MPM-";
  for (let i = 0; i < 4; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  code += "-";
  for (let i = 0; i < 4; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

// ── TYPES ────────────────────────────────────────

export interface AccessGrant {
  id: string;
  stripe_session_id: string;
  email: string | null;
  code: string;
  type: "single" | "monthly";
  expires_at: string | null;
  created_at: string;
}

// ── QUERIES ──────────────────────────────────────

/**
 * Create an access grant for a Stripe session.
 * Idempotent: if stripe_session_id already exists, returns existing grant.
 */
export async function createAccessGrant(
  stripeSessionId: string,
  email: string | null,
  type: "single" | "monthly"
): Promise<AccessGrant> {
  // Check if already exists (idempotent)
  const existing = await getGrantByStripeSession(stripeSessionId);
  if (existing) return existing;

  const code = generateCode();
  const expiresAt = type === "single"
    ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    : null;

  // INSERT with ON CONFLICT for race-condition safety
  await sql`
    INSERT INTO access_grants (stripe_session_id, email, code, type, expires_at)
    VALUES (${stripeSessionId}, ${email}, ${code}, ${type}, ${expiresAt ? expiresAt : null})
    ON CONFLICT (stripe_session_id) DO NOTHING
  `;

  // Return the grant (either just inserted or existing from race)
  const grant = await getGrantByStripeSession(stripeSessionId);
  if (!grant) throw new Error("Failed to create or retrieve access grant");
  return grant;
}

/**
 * Look up a grant by Stripe session ID.
 */
export async function getGrantByStripeSession(
  stripeSessionId: string
): Promise<AccessGrant | null> {
  const { rows } = await sql`
    SELECT * FROM access_grants WHERE stripe_session_id = ${stripeSessionId} LIMIT 1
  `;
  return (rows[0] as AccessGrant) || null;
}

/**
 * Look up a grant by access code.
 */
export async function getGrantByCode(code: string): Promise<AccessGrant | null> {
  const { rows } = await sql`
    SELECT * FROM access_grants WHERE code = ${code} LIMIT 1
  `;
  return (rows[0] as AccessGrant) || null;
}

/**
 * Look up the most recent active grant by email.
 * For "single" type, checks that it hasn't expired.
 * For "monthly" type, returns it (Stripe subscription status checked separately).
 */
export async function getGrantByEmail(email: string): Promise<AccessGrant | null> {
  const { rows } = await sql`
    SELECT * FROM access_grants
    WHERE LOWER(email) = LOWER(${email})
    AND (type = 'monthly' OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return (rows[0] as AccessGrant) || null;
}
