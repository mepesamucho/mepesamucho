/**
 * /api/stripe/confirm — Confirm a Stripe checkout session and return access grant
 *
 * POST { session_id: "cs_..." }
 *
 * 1. Retrieves session from Stripe
 * 2. Validates payment_status === "paid"
 * 3. Looks up or creates access grant in Postgres
 * 4. Returns { ok, code, email, type, expires_at }
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAccessGrant, getGrantByStripeSession } from "@/lib/db";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();

    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json({ ok: false, error: "session_id requerido" }, { status: 400 });
    }

    // 1. Retrieve session from Stripe
    const stripe = getStripe();
    let session: Stripe.Checkout.Session;

    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch {
      return NextResponse.json({ ok: false, error: "Sesión no encontrada" }, { status: 404 });
    }

    // 2. Validate payment
    if (session.payment_status !== "paid") {
      return NextResponse.json({ ok: false, error: "Pago no completado" }, { status: 402 });
    }

    // 3. Look up existing grant or create one (race condition: confirm arrives before webhook)
    let grant = await getGrantByStripeSession(session_id);

    if (!grant) {
      const email = session.customer_details?.email || null;
      const type = (session.metadata?.type as "single" | "monthly") || "single";
      const grantType: "single" | "monthly" = type === "monthly" ? "monthly" : "single";
      grant = await createAccessGrant(session_id, email, grantType);
    }

    // 4. Return grant info
    return NextResponse.json({
      ok: true,
      code: grant.code,
      email: grant.email,
      type: grant.type,
      expires_at: grant.expires_at,
    });
  } catch (err) {
    console.error("Error en /api/stripe/confirm:", err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
