import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { sessionId, lookupType } = (await req.json()) as { sessionId?: string; lookupType?: string };

    // Primary path: verify by session ID
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        return NextResponse.json({ success: true, type: session.metadata?.type || "unknown", sessionId });
      }
      return NextResponse.json({ success: false });
    }

    // Fallback path: look up most recent paid session (for Safari query param stripping)
    if (lookupType) {
      console.log(`Fallback verify: looking up recent ${lookupType} sessions`);
      const mode = lookupType === "subscription" ? "subscription" : "payment";
      const sessions = await stripe.checkout.sessions.list({
        limit: 5,
        status: "complete",
      });

      // Find the most recent paid session of this type (within last 5 minutes)
      const fiveMinAgo = Math.floor(Date.now() / 1000) - 300;
      const match = sessions.data.find(
        (s) =>
          s.metadata?.type === lookupType &&
          s.payment_status === "paid" &&
          s.created >= fiveMinAgo
      );

      if (match) {
        console.log(`Fallback verify: found matching session ${match.id}`);
        return NextResponse.json({ success: true, type: match.metadata?.type || lookupType, sessionId: match.id });
      }

      console.log(`Fallback verify: no matching session found for type ${lookupType}`);
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({ error: "Session ID o tipo requerido" }, { status: 400 });
  } catch (error) {
    console.error("Error verificando session:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
