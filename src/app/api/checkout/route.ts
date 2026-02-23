import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

type ProductType = "subscription" | "daypass" | "single";

function getPriceId(type: ProductType): string | undefined {
  const map: Record<ProductType, string | undefined> = {
    subscription: process.env.STRIPE_PRICE_SUBSCRIPTION,
    daypass: process.env.STRIPE_PRICE_DAYPASS,
    single: process.env.STRIPE_PRICE_SINGLE,
  };
  return map[type];
}

export async function POST(req: NextRequest) {
  try {
    // Check Stripe is configured before anything
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "El sistema de pagos no está configurado. Intenta más tarde." },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const { type } = (await req.json()) as { type: ProductType };

    const priceId = getPriceId(type);
    if (!priceId) {
      console.error(`Price ID not configured for type: ${type}. Env vars: SUBSCRIPTION=${process.env.STRIPE_PRICE_SUBSCRIPTION ? "set" : "missing"}, SINGLE=${process.env.STRIPE_PRICE_SINGLE ? "set" : "missing"}, DAYPASS=${process.env.STRIPE_PRICE_DAYPASS ? "set" : "missing"}`);
      return NextResponse.json(
        { error: "Este tipo de pago no está disponible en este momento." },
        { status: 400 }
      );
    }

    const isSubscription = type === "subscription";
    // Always use www to avoid 307 redirect that strips query params on some mobile browsers
    const appUrl = "https://www.mepesamucho.com";

    console.log(`Creating checkout: type=${type}, priceId=${priceId.substring(0, 20)}..., mode=${isSubscription ? "subscription" : "payment"}, successUrl=${appUrl}`);

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?canceled=true`,
      locale: "es",
      metadata: { type: isSubscription ? "monthly" : "single" },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const stripeError = error instanceof Stripe.errors.StripeError ? error : null;
    const errorMsg = stripeError
      ? `Stripe error [${stripeError.type}]: ${stripeError.message}`
      : `Unknown error: ${error}`;
    console.error("Error creando checkout session:", errorMsg);
    return NextResponse.json(
      { error: "Error procesando el pago. Verifica la configuración de Stripe." },
      { status: 500 }
    );
  }
}
