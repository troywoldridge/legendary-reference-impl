import "server-only";

import Link from "next/link";
import QuickCheckoutDemo from "./QuickCheckoutDemo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <main className="container-page py-10">
      <section className="card card-pad">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm muted">
              <Link className="hover:underline" href="/products">
                ← Continue shopping
              </Link>
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Cart</h1>
            <p className="mt-1 text-sm muted">
              Demo checkout flow: compute totals server-side and create a Stripe PaymentIntent.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a className="btn" href="/api/products?limit=5&status=active" target="_blank" rel="noreferrer">
              Products API →
            </a>
            <a className="btn" href="/google/merchant-feed" target="_blank" rel="noreferrer">
              Merchant Feed →
            </a>
          </div>
        </div>

        <div className="divider my-6" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <QuickCheckoutDemo />

            <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "rgb(var(--border))" }}>
              <div className="text-sm font-semibold">What this demonstrates</div>
              <ul className="mt-2 text-sm muted list-disc pl-5 space-y-1">
                <li>Server-side totals calculation (no client trust).</li>
                <li>Stripe PaymentIntent created from database-backed prices + adjustments.</li>
                <li>Clean API routes matching a real storefront architecture.</li>
              </ul>
            </div>
          </div>

          <aside className="card card-pad h-fit">
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="mt-1 text-sm muted">This panel will become dynamic when cart state is wired.</p>

            <div className="divider my-5" />

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="muted">Subtotal</dt>
                <dd className="font-medium">$0.00</dd>
              </div>
              <div className="flex justify-between">
                <dt className="muted">Shipping</dt>
                <dd className="font-medium">$0.00</dd>
              </div>
              <div className="flex justify-between">
                <dt className="muted">Tax</dt>
                <dd className="font-medium">$0.00</dd>
              </div>
              <div className="flex justify-between">
                <dt className="muted">Credits</dt>
                <dd className="font-medium">-$0.00</dd>
              </div>
              <div className="divider my-2" />
              <div className="flex justify-between text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold">$0.00</dd>
              </div>
            </dl>

            <Link className="btn btn-primary mt-5 w-full" href="/products">
              Add items (browse) →
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

