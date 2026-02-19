import { NextRequest, NextResponse } from "next/server";

// ── In-memory rate limiter (per serverless instance) ──────
// For production at scale, use Upstash @upstash/ratelimit instead.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) stores.set(name, new Map());
  return stores.get(name)!;
}

export function checkRateLimit(
  req: NextRequest,
  name: string,
  maxRequests: number,
  windowMs: number
): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const store = getStore(name);
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return null; // allowed
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento antes de intentar de nuevo." },
      { status: 429 }
    );
  }

  // Cleanup old entries periodically
  if (store.size > 500) {
    for (const [key, val] of store) {
      if (now > val.resetAt) store.delete(key);
    }
  }

  return null; // allowed
}
