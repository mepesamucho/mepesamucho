import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-01-28.clover" });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { sessionId } = (await req.json()) as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID requerido" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return NextResponse.json({ success: true, type: session.metadata?.type || "unknown" });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.error("Error verificando session:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
