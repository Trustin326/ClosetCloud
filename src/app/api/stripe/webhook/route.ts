import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id || session.client_reference_id;
    const product = session.metadata?.product;
    if (!userId || !product) return NextResponse.json({ received: true });
    if (session.payment_status === "paid" || session.mode === "subscription") {
      const admin = createAdminClient();
      const { error } = await admin.from("purchases").upsert({
        stripe_session_id: session.id, user_id: userId, product, status: "paid",
        amount_total: session.amount_total, currency: session.currency
      }, { onConflict: "stripe_session_id" });
      if (error) return NextResponse.json({ error: "Purchase recording failed." }, { status: 500 });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id || session.client_reference_id;
    if (userId) {
      const admin = createAdminClient();
      const { error } = await admin.from("purchases").upsert({
        stripe_session_id: session.id, user_id: userId, product: session.metadata?.product || "unknown",
        status: "expired", amount_total: session.amount_total, currency: session.currency
      }, { onConflict: "stripe_session_id" });
      if (error) return NextResponse.json({ error: "Unable to record expired checkout." }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}