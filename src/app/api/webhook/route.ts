import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { savePaymentSession, markSubscriptionCancelled, type AccessType } from "@/lib/access";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ── Idempotency: track processed events (in-memory per instance) ──
const processedEvents = new Map<string, number>();
const MAX_PROCESSED = 1000;

function wasAlreadyProcessed(eventId: string): boolean {
  if (processedEvents.has(eventId)) return true;
  // Cleanup old entries if map gets large
  if (processedEvents.size > MAX_PROCESSED) {
    const cutoff = Date.now() - 3600_000; // 1 hour
    for (const [id, ts] of processedEvents) {
      if (ts < cutoff) processedEvents.delete(id);
    }
  }
  processedEvents.set(eventId, Date.now());
  return false;
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check — skip if already processed
  if (wasAlreadyProcessed(event.id)) {
    console.log(`Evento ya procesado (idempotente): ${event.id}`);
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const type = (session.metadata?.type as AccessType) || "single";
      const customerId = typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

      console.log(`Pago completado: ${type}, session: ${session.id}`);

      // Save to KV so /api/save-access can verify it
      try {
        await savePaymentSession(session.id, type, customerId);
      } catch (err) {
        console.error("Error saving payment session to KV:", err);
        // Non-fatal — save-access will fallback to Stripe verification
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;

      console.log(`Suscripción cancelada: ${subscription.id}, customer: ${customerId}`);

      if (customerId) {
        try {
          await markSubscriptionCancelled(customerId);
        } catch (err) {
          console.error("Error marking subscription cancelled:", err);
        }
      }
      break;
    }
    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
