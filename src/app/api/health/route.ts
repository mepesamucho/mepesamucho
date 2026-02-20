import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  const config: Record<string, unknown> = {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 8)}...` : "MISSING",
      priceSubscription: process.env.STRIPE_PRICE_SUBSCRIPTION || "MISSING",
      priceSingle: process.env.STRIPE_PRICE_SINGLE || "MISSING",
      priceDaypass: process.env.STRIPE_PRICE_DAYPASS || "MISSING",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? "SET" : "MISSING",
    },
    redis: {
      kvUrl: process.env.KV_REST_API_URL ? "SET" : "MISSING",
      kvToken: process.env.KV_REST_API_TOKEN ? "SET" : "MISSING",
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || "NOT SET (using default)",
      anthropicKey: process.env.ANTHROPIC_API_KEY ? "SET" : "MISSING",
      emailHashSecret: process.env.EMAIL_HASH_SECRET ? "SET" : "MISSING",
    },
  };

  // Validate Stripe prices if key is available
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      // List all active prices
      const prices = await stripe.prices.list({ active: true, limit: 20, expand: ["data.product"] });
      config.activePrices = prices.data.map((p) => ({
        id: p.id,
        product: typeof p.product === "object" && p.product !== null ? (p.product as Stripe.Product).name : p.product,
        amount: p.unit_amount ? p.unit_amount / 100 : null,
        currency: p.currency,
        type: p.type,
        recurring: p.recurring ? `${p.recurring.interval}` : "one-time",
        active: p.active,
      }));

      // Check configured prices
      const priceIds = [
        process.env.STRIPE_PRICE_SUBSCRIPTION,
        process.env.STRIPE_PRICE_SINGLE,
        process.env.STRIPE_PRICE_DAYPASS,
      ].filter(Boolean) as string[];

      const priceValidation: Record<string, string> = {};
      for (const pid of priceIds) {
        try {
          const price = await stripe.prices.retrieve(pid, { expand: ["product"] });
          const product = typeof price.product === "object" && price.product !== null ? price.product as Stripe.Product : null;
          priceValidation[pid] = `${price.active ? "ACTIVE" : "INACTIVE"} | product: ${product ? `${product.name} (${product.active ? "active" : "INACTIVE"})` : "unknown"}`;
        } catch {
          priceValidation[pid] = "NOT FOUND";
        }
      }
      config.priceValidation = priceValidation;
    } catch (err) {
      config.stripeError = `${err}`;
    }
  }

  return NextResponse.json(config);
}
