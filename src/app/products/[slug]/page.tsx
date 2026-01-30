import Link from "next/link";
import { serverFetchJson } from "@/lib/http";

type ProductResponse = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  brand: string;
  priceCents: number;
  compareAtCents: number | null;
  quantity: number;
  status: "draft" | "active" | "archived";
  images: Array<{ id: string; alt: string | null; sortOrder: number; url: string | null }>;
};

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await serverFetchJson<ProductResponse>(`/api/products/${encodeURIComponent(slug)}`);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm opacity-80">
        <Link className="hover:underline" href="/products">
          ← Back to Products
        </Link>
      </p>

      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
        <section className="space-y-3">
          <div className="rounded border p-3">
            {p.images?.[0]?.url ? (
              // Using plain <img> keeps this demo dead-simple. Swap to next/image later.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.images[0].url}
                alt={p.images[0].alt || p.title}
                className="h-auto w-full rounded"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded bg-white/5 text-sm opacity-70">
                No image (demo)
              </div>
            )}
          </div>

          {p.images?.length > 1 ? (
            <div className="grid grid-cols-3 gap-2">
              {p.images.slice(1, 7).map((img) => (
                <div key={img.id} className="rounded border p-2">
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.url} alt={img.alt || p.title} className="h-auto w-full rounded" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded bg-white/5 text-xs opacity-70">
                      No image
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section>
          <h1 className="text-3xl font-semibold tracking-tight">{p.title}</h1>
          <div className="mt-2 text-sm opacity-80">{p.brand}</div>

          <div className="mt-5 flex items-baseline gap-3">
            <div className="text-2xl font-semibold">{money(p.priceCents)}</div>
            {p.compareAtCents ? <div className="text-sm line-through opacity-60">{money(p.compareAtCents)}</div> : null}
          </div>

          <div className="mt-2 text-sm opacity-80">{p.quantity > 0 ? `${p.quantity} in stock` : "Out of stock"}</div>

          {p.description ? <p className="mt-6 text-sm opacity-80">{p.description}</p> : null}

          <div className="mt-8 rounded border p-4">
            <div className="text-sm font-medium">Checkout Demo</div>
            <p className="mt-2 text-sm opacity-80">
              Next step is wiring a small cart and hitting <code className="rounded bg-white/5 px-1 py-0.5">/api/create-payment-intent</code>.
            </p>
            <form className="mt-4" action="/cart" method="get">
              <button className="rounded border px-3 py-2 text-sm hover:opacity-80" type="submit">
                Go to Cart →
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
