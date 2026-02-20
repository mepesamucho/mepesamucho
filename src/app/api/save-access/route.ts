import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  generateAccessCode,
  saveEmailAccess,
  saveCodeAccess,
  getPaymentSession,
  type AccessType,
} from "@/lib/access";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
const stripe = getStripe();

export async function POST(req: NextRequest) {
  try {
    const { sessionId, method, email } = await req.json();

    if (!sessionId || !method) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    if (method !== "email" && method !== "code") {
      return NextResponse.json({ error: "Método no válido" }, { status: 400 });
    }

    if (method === "email" && !email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // Verify payment with Stripe first
    let type: AccessType;
    let customerId: string | undefined;

    // Try KV first (set by webhook)
    const kvSession = await getPaymentSession(sessionId);
    if (kvSession) {
      type = kvSession.type;
      customerId = kvSession.customerId;
    } else {
      // Fallback: verify directly with Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Pago no verificado" }, { status: 403 });
      }
      type = (session.metadata?.type as AccessType) || "single";
      customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    }

    // Save access based on method
    if (method === "email") {
      await saveEmailAccess(email, type, sessionId, customerId);
      return NextResponse.json({ success: true });
    }

    // method === "code"
    const code = generateAccessCode();
    await saveCodeAccess(code, type, sessionId, customerId);
    return NextResponse.json({ success: true, code });
  } catch (err) {
    console.error("save-access error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
