import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-01-28.clover" });
}

type ProductType = "subscription" | "daypass" | "single";

const PRICE_MAP: Record<ProductType, string | undefined> = {
  subscription: process.env.STRIPE_PRICE_SUBSCRIPTION,
  daypass: process.env.STRIPE_PRICE_DAYPASS,
  single: process.env.STRIPE_PRICE_SINGLE,
};

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { type } = (await req.json()) as { type: ProductType };

    const priceId = PRICE_MAP[type];
    if (!priceId) {
      return NextResponse.json({ error: "Tipo de producto invalido" }, { status: 400 });
    }

    const isSubscription = type === "subscription";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}?session_id={CHECKOUT_SESSION_ID}&type=${type}`,
      cancel_url: `${appUrl}?canceled=true`,
      locale: "es",
      metadata: { type },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creando checkout session:", error);
    return NextResponse.json({ error: "Error procesando el pago" }, { status: 500 });
  }
}
