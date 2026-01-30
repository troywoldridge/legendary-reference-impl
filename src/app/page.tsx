import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container-page py-10">
      <section className="card card-pad">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Legendary Reference Implementation</h1>
            <p className="mt-2 text-sm muted max-w-2xl">
              A public-safe, production-style demo showing the patterns behind Legendary Collectibles:
              Next.js App Router, Postgres + Drizzle, Stripe intents, and Google Merchant feeds.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-primary" href="/products">
              Browse Products →
            </Link>
            <Link className="btn" href="/cart">
              Cart Demo →
            </Link>
          </div>
        </div>

        <div className="divider my-6" />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="text-sm font-medium">Catalog API</div>
            <p className="mt-1 text-sm muted">DB-driven endpoints powering /products.</p>
          </div>

          <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="text-sm font-medium">Stripe Intent</div>
            <p className="mt-1 text-sm muted">Server-side totals (subtotal + ship + tax − credits).</p>
          </div>

          <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="text-sm font-medium">Merchant Feed</div>
            <p className="mt-1 text-sm muted">TSV feed endpoint for Google Merchant Center.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
