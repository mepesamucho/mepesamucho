import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  verifyEmailAccess,
  verifyCodeAccess,
  isSubscriptionCancelled,
  isRedisConfigured,
} from "@/lib/access";

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

    // Check Redis is configured
    if (!isRedisConfigured()) {
      return NextResponse.json(
        { success: false, error: "El servicio de acceso no está disponible en este momento. Intenta más tarde." },
        { status: 503 }
      );
    }

    const { email, code } = await req.json();

    if (!email && !code) {
      return NextResponse.json(
        { success: false, error: "Proporciona email o código" },
        { status: 400 }
      );
    }

    const record = email
      ? await verifyEmailAccess(email)
      : await verifyCodeAccess(code);

    if (!record) {
      return NextResponse.json({
        success: false,
        error: email
          ? "No se encontró acceso con ese email. Verifica que sea el mismo que usaste."
          : "Código no válido o expirado. Verifica que esté bien escrito.",
      });
    }

    // For subscriptions, verify it's still active
    if (record.type === "subscription" && record.stripeCustomerId) {
      const cancelled = await isSubscriptionCancelled(record.stripeCustomerId);
      if (cancelled) {
        return NextResponse.json({
          success: false,
          error: "Tu suscripción fue cancelada. Puedes suscribirte de nuevo cuando quieras.",
        });
      }

      // Double-check with Stripe
      const stripe = getStripe();
      if (stripe) {
        try {
          const subs = await stripe.subscriptions.list({
            customer: record.stripeCustomerId,
            status: "active",
            limit: 1,
          });
          if (subs.data.length === 0) {
            return NextResponse.json({
              success: false,
              error: "Tu suscripción ya no está activa. Puedes suscribirte de nuevo.",
            });
          }
        } catch {
          // If Stripe check fails, trust KV record
        }
      }
    }

    // Calculate what to restore in localStorage
    const restore: { type: string; expiresAt?: number; hoursLeft?: number } = {
      type: record.type,
    };

    if (record.type === "daypass" && record.expiresAt) {
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
