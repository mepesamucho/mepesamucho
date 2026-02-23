/**
 * /api/billing-portal — Create a Stripe Customer Portal session
 *
 * POST { email: "user@example.com" }
 *
 * Looks up the Stripe customer by email, creates a portal session,
 * and returns the URL where the user can manage/cancel their subscription.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "Email requerido" }, { status: 400 });
    }

    const stripe = getStripe();

    // Find customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "No encontramos una suscripción con ese email.",
      });
    }

    const customer = customers.data[0];

    // Create a billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: "https://www.mepesamucho.com?from=portal",
    });

    return NextResponse.json({ ok: true, url: portalSession.url });
  } catch (err) {
    console.error("Error en /api/billing-portal:", err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
