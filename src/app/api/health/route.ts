import { NextResponse } from "next/server";

export async function GET() {
  const config = {
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

  return NextResponse.json(config);
}
