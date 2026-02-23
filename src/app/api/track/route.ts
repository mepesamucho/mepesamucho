/**
 * /api/track — Anonymous telemetry endpoint for mepesamucho.com
 *
 * PRIVACY:
 * - Denylist filter strips any field that could contain PII or user content.
 * - IP is NOT stored. Rate limit uses in-memory map (resets on deploy).
 * - Logs to console for now; can be forwarded to any analytics provider later.
 *
 * Accepts single events or batches: { name, props, anonId, ts } or { batch: [...] }
 */

import { NextRequest, NextResponse } from "next/server";

// ── Denylist: fields that must NEVER be stored ────────────────────────────────

const DENIED_FIELDS = new Set([
  "text", "texto", "message", "mensaje", "email", "code", "codigo",
  "content", "contenido", "password", "token", "secret", "ip",
  "respuesta", "reflexion", "continuacion", "cierreTexto",
]);

function sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (DENIED_FIELDS.has(key.toLowerCase())) continue;
    // Only allow primitives and short strings
    if (typeof value === "string" && value.length > 200) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
    }
  }
  return clean;
}

// ── Rate limit: 30 req/min per IP ─────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// ── Allowed event names ───────────────────────────────────────────────────────

const ALLOWED_EVENTS = new Set([
  "session_start",
  "session_end",
  "paywall_view",
  "checkout_start",
  "purchase_success",
  "purchase_cancel",
  "recover_access_attempt",
  "recover_access_result",
]);

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrackEvent {
  name: string;
  props?: Record<string, unknown>;
  anonId?: string;
  ts?: number;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Handle batch or single event
  const events: TrackEvent[] = [];

  if (body && typeof body === "object" && "batch" in body && Array.isArray((body as { batch: unknown }).batch)) {
    const batch = (body as { batch: unknown[] }).batch;
    // Max 50 events per batch
    for (const item of batch.slice(0, 50)) {
      if (item && typeof item === "object" && "name" in item) {
        events.push(item as TrackEvent);
      }
    }
  } else if (body && typeof body === "object" && "name" in body) {
    events.push(body as TrackEvent);
  } else {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  // Process each event
  for (const event of events) {
    if (!ALLOWED_EVENTS.has(event.name)) continue;

    const sanitized = {
      name: event.name,
      props: sanitizeProps(event.props || {}),
      anonId: typeof event.anonId === "string" ? event.anonId.slice(0, 36) : undefined,
      ts: typeof event.ts === "number" ? event.ts : Date.now(),
    };

    // ── Log to console (structured JSON for Vercel logs) ──
    // Replace this with your analytics provider when ready:
    // e.g., posthog.capture(), mixpanel.track(), or INSERT INTO events
    console.log("[TRACK]", JSON.stringify(sanitized));
  }

  return NextResponse.json({ ok: true, received: events.length });
}
