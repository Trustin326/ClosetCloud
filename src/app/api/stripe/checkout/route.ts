import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { z } from "zod";
const schema = z.object({ product: z.enum(["creator_monthly", "stylebook"]) });
export async function POST(request: Request) {
  const { user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in before checkout." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  const price = parsed.data.product === "creator_monthly" ? process.env.STRIPE_PRICE_CREATOR_MONTHLY : process.env.STRIPE_PRICE_STYLEBOOK;
  if (!price || !process.env.NEXT_PUBLIC_SITE_URL) return NextResponse.json({ error: "Checkout is not configured." }, { status: 503 });
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({ mode: parsed.data.product === "creator_monthly" ? "subscription" : "payment", line_items: [{ price, quantity: 1 }], client_reference_id: user.id, customer_email: user.email, metadata: { user_id: user.id, product: parsed.data.product }, success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success?checkout_session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/cancel` });
    return NextResponse.json({ url: session.url });
  } catch { return NextResponse.json({ error: "Checkout could not start." }, { status: 500 }); }
}