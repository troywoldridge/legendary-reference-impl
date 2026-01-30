import Link from "next/link";
import { serverFetchJson } from "@/lib/http";

type ProductsResponse = {
  items: Array<{
    id: string;
    title: string;
    slug: string;
    priceCents: number;
    compareAtCents: number | null;
    status: "draft" | "active" | "archived";
    quantity: number;
    createdAt: string;
    imageCount: number;
    primaryImageUrl: string | null;
    primaryAlt: string | null;
  }>;
  page: number;
  limit: number;
  total: number;
};

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = typeof sp.page === "string" ? sp.page : "1";
  const sort = typeof sp.sort === "string" ? sp.sort : "new";

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  qs.set("page", page);
  qs.set("sort", sort);
  qs.set("status", "active");
  qs.set("limit", "24");

  const data = await serverFetchJson<ProductsResponse>(`/api/products?${qs.toString()}`);

  return (
    <main className="container-page py-10">
      <section className="card card-pad">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
            <p className="mt-1 text-sm muted">
              Showing {data.items.length} of {data.total} items
            </p>
          </div>

          <form className="flex flex-wrap gap-2" action="/products" method="get">
            <input name="q" defaultValue={q} placeholder="Search products…" className="input w-64" />
            <select name="sort" defaultValue={sort} className="select">
              <option value="new">Newest</option>
              <option value="price_asc">Price (low → high)</option>
              <option value="price_desc">Price (high → low)</option>
            </select>
            <button className="btn btn-primary" type="submit">
              Apply
            </button>
          </form>
        </div>

        <div className="divider my-6" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="card overflow-hidden">
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "#f1f5f9",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {p.primaryImageUrl ? (
                  <img
                    src={p.primaryImageUrl}
                    alt={p.primaryAlt || p.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ display: "grid", placeItems: "center", height: "100%" }} className="muted">
                    No image
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold leading-snug">{p.title}</h2>
                  <span className="badge">{p.imageCount} img</span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <div className="text-xl font-semibold">{money(p.priceCents)}</div>
                  {p.compareAtCents ? <div className="text-sm muted line-through">{money(p.compareAtCents)}</div> : null}
                </div>

                <div className="mt-2 text-sm muted">{p.quantity > 0 ? `${p.quantity} in stock` : "Out of stock"}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
