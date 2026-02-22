import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  verifyEmailAccess,
  verifyCodeAccess,
  isSubscriptionCancelled,
  isRedisConfigured,
} from "@/lib/access";
import { getGrantByEmail, getGrantByCode } from "@/lib/db";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ── Rate limiting (in-memory, per instance) ────
const attempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max attempts
const RATE_WINDOW = 60_000; // per 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos. Espera un momento antes de intentar de nuevo." },
        { status: 429 }
      );
    }

    const { email, code } = await req.json();

    if (!email && !code) {
      return NextResponse.json(
        { success: false, error: "Proporciona email o código" },
        { status: 400 }
      );
    }

    // ── 1. Try Redis first (backward compat with old payments) ──
    let record = null;
    if (isRedisConfigured()) {
      try {
        record = email
          ? await verifyEmailAccess(email)
          : await verifyCodeAccess(code);
      } catch {
        // Redis failed, try Postgres
      }
    }

    // ── 2. Fallback to Postgres (ETAPA 3 payments) ──
    if (!record) {
      try {
        const grant = email
          ? await getGrantByEmail(email)
          : code ? await getGrantByCode(code) : null;

        if (grant) {
          // Map Postgres grant to recover-access response format
          const grantType = grant.type === "monthly" ? "subscription" : "single";
          record = {
            type: grantType,
            expiresAt: grant.expires_at ? new Date(grant.expires_at).getTime() : undefined,
            stripeSessionId: grant.stripe_session_id,
          };
        }
      } catch (err) {
        console.error("Postgres lookup failed:", err);
      }
    }

    if (!record) {
      return NextResponse.json({
        success: false,
        error: email
          ? "No se encontró acceso con ese email. Verifica que sea el mismo que usaste."
          : "Código no válido o expirado. Verifica que esté bien escrito.",
      });
    }

    // ── 3. For subscriptions, verify still active via Stripe ──
    if (record.type === "subscription") {
      // Try to get customer ID from Stripe session
      const stripe = getStripe();
      if (stripe && record.stripeSessionId) {
        try {
          const session = await stripe.checkout.sessions.retrieve(record.stripeSessionId);
          const customerId = typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

          if (customerId) {
            // Check KV cancellation flag
            const cancelled = isRedisConfigured() ? await isSubscriptionCancelled(customerId) : false;
            if (cancelled) {
              return NextResponse.json({
                success: false,
                error: "Tu suscripción fue cancelada. Puedes suscribirte de nuevo cuando quieras.",
              });
            }

            // Verify active subscription with Stripe
            const subs = await stripe.subscriptions.list({
              customer: customerId,
              status: "active",
              limit: 1,
            });
            if (subs.data.length === 0) {
              return NextResponse.json({
                success: false,
                error: "Tu suscripción ya no está activa. Puedes suscribirte de nuevo.",
              });
            }
          }
        } catch {
          // If Stripe check fails, trust the record
        }
      }
    }

    // ── 4. Calculate restore info ──
    const restore: { type: string; expiresAt?: number; hoursLeft?: number } = {
      type: record.type,
    };

    if ((record.type === "daypass" || record.type === "single") && record.expiresAt) {
      const remaining = record.expiresAt - Date.now();
      if (remaining <= 0) {
        return NextResponse.json({
          success: false,
          error: "Tu pase de 24 horas ya expiró.",
        });
      }
      restore.expiresAt = record.expiresAt;
      restore.hoursLeft = Math.ceil(remaining / 3600000);
    }

    return NextResponse.json({ success: true, ...restore });
  } catch (err) {
    console.error("recover-access error:", err);
    // Distinguish between Redis connection errors and other errors
    const message = err instanceof Error && err.message.includes("ECONNREFUSED")
      ? "No pudimos verificar tu acceso en este momento. Intenta de nuevo en unos minutos."
      : "Ocurrió un problema al verificar tu acceso. Intenta de nuevo.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
