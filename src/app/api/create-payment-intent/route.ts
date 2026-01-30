import "server-only";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { CreateIntentSchema, clampNonNegative } from "@/lib/pricing/totals";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) throw new Error("Missing STRIPE_SECRET_KEY");

const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateIntentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const { lines, shippingCents, taxCents, creditsCents } = parsed.data;

  const ids = Array.from(new Set(lines.map((l) => l.productId)));
  const rows = await db
    .select({ id: products.id, priceCents: products.priceCents, status: products.status })
    .from(products)
    .where(inArray(products.id, ids));

  const byId = new Map(rows.map((r) => [r.id, r]));
  let subtotal = 0;

  for (const l of lines) {
    const p = byId.get(l.productId);
    if (!p || p.status !== "active") {
      return NextResponse.json({ error: "Invalid product in cart" }, { status: 400 });
    }
    subtotal += p.priceCents * l.qty;
  }

  // ✅ server-side amount calc (subtotal + shipping + tax − credits)
  const amount = clampNonNegative(subtotal + shippingCents + taxCents - creditsCents);

  const pi = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      subtotalCents: String(subtotal),
      shippingCents: String(shippingCents),
      taxCents: String(taxCents),
      creditsCents: String(creditsCents),
    },
  });

  return NextResponse.json({ clientSecret: pi.client_secret, amount });
}
