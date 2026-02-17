import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  verifyEmailAccess,
  verifyCodeAccess,
  isSubscriptionCancelled,
} from "@/lib/access";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email && !code) {
      return NextResponse.json({ error: "Proporciona email o código" }, { status: 400 });
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
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
