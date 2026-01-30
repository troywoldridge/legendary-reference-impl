"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ProductLite = {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
};

type ProductsApiResponse = {
  items: ProductLite[];
  page: number;
  limit: number;
  total: number;
};

type CreateIntentPayload = {
  lines: Array<{ productId: string; qty: number }>;
  shippingCents: number;
  taxCents: number;
  creditsCents: number;
};

type IntentOk = {
  ok: true;
  clientSecret: string;
  amountCents?: number;
};

type IntentErr = {
  ok: false;
  error: string;
};

type IntentResponse = IntentOk | IntentErr;

type UnknownJson = Record<string, unknown>;

function isObject(v: unknown): v is UnknownJson {
  return typeof v === "object" && v !== null;
}

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function safeJsonString(v: unknown) {
  return JSON.stringify(v, null, 2);
}

function toNumber(v: string, fallback: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.floor(n);
}

function pickString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function pickNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

function extractIntentFromJson(json: unknown): { clientSecret: string | null; amountCents?: number } {
  if (!isObject(json)) return { clientSecret: null };

  // Common shapes:
  // { clientSecret: "..." }
  // { client_secret: "..." }
  // { data: { clientSecret: "..." } }
  // plus optional amount fields
  const direct = pickString(json.clientSecret) || pickString(json.client_secret);

  let nested: string | null = null;
  const data = json.data;
  if (isObject(data)) {
    nested = pickString(data.clientSecret) || pickString(data.client_secret);
  }

  const amountCents =
    pickNumber(json.amountCents) ??
    pickNumber(json.amount_cents) ??
    (isObject(data) ? pickNumber(data.amountCents) ?? pickNumber(data.amount_cents) : undefined);

  return { clientSecret: direct || nested, amountCents };
}

export default function QuickCheckoutDemo() {
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [product, setProduct] = useState<ProductLite | null>(null);

  const [shippingCents, setShippingCents] = useState(599);
  const [taxCents, setTaxCents] = useState(0);
  const [creditsCents, setCreditsCents] = useState(0);

  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<IntentResponse | null>(null);

  const payload: CreateIntentPayload = useMemo(() => {
    return {
      lines: product ? [{ productId: product.id, qty: 1 }] : [{ productId: "REPLACE_WITH_A_PRODUCT_UUID", qty: 1 }],
      shippingCents,
      taxCents,
      creditsCents,
    };
  }, [product, shippingCents, taxCents, creditsCents]);

  const curl = useMemo(() => {
    const body = JSON.stringify(payload);
    // escape single quotes for bash
    const escaped = body.replaceAll("'", "'\\''");
    return `curl -s -X POST http://localhost:3010/api/create-payment-intent -H "content-type: application/json" -d '${escaped}' | jq`;
  }, [payload]);

  async function loadProduct() {
    setLoadingProduct(true);
    setResult(null);

    try {
      const res = await fetch("/api/products?status=active&limit=1&sort=new", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load products (${res.status})`);

      const data = (await res.json()) as ProductsApiResponse;
      const p = data.items?.[0] ?? null;
      setProduct(p);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load product";
      setProduct(null);
      setResult({ ok: false, error: msg });
    } finally {
      setLoadingProduct(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore (user can manually copy)
    }
  }

  async function createIntent() {
    setCreating(true);
    setResult(null);

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();

      let json: unknown = null;
      if (txt) {
        try {
          json = JSON.parse(txt) as unknown;
        } catch {
          json = null;
        }
      }

      if (!res.ok) {
        // prefer server-provided error if present
        const serverError =
          isObject(json) ? pickString(json.error) || (isObject(json.data) ? pickString(json.data.error) : null) : null;
        throw new Error(serverError || `Request failed (${res.status})`);
      }

      const extracted = extractIntentFromJson(json);
      if (!extracted.clientSecret) throw new Error("No clientSecret returned from endpoint");

      setResult({ ok: true, clientSecret: extracted.clientSecret, amountCents: extracted.amountCents });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create PaymentIntent";
      setResult({ ok: false, error: msg });
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "rgb(var(--border))" }}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold">Quick checkout test</div>
        <span className="badge">live demo</span>
      </div>

      <p className="mt-2 text-sm muted">
        Working demo: pick a product, then create a Stripe PaymentIntent using server-side totals.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div
          className="md:col-span-2 rounded-xl border bg-slate-50 p-4 text-sm"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">Selected product</div>
              {product ? (
                <div className="mt-1">
                  <div className="text-sm">{product.title}</div>
                  <div className="text-xs muted">
                    {money(product.priceCents)} • <span className="font-mono">{product.id}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-xs muted">No product loaded yet.</div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn" type="button" onClick={loadProduct} disabled={loadingProduct}>
                {loadingProduct ? "Loading…" : "Reload"}
              </button>

              {product ? (
                <>
                  <button className="btn" type="button" onClick={() => copy(product.id)}>
                    Copy ID
                  </button>
                  <Link className="btn" href={`/products/${product.slug}`}>
                    View →
                  </Link>
                </>
              ) : (
                <Link className="btn" href="/products">
                  Browse →
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-4 text-sm" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="font-medium">Adjustments</div>

          <div className="mt-3 grid gap-2">
            <label className="text-xs muted">
              Shipping (cents)
              <input
                className="input mt-1"
                value={shippingCents}
                onChange={(e) => setShippingCents(toNumber(e.target.value, 599))}
              />
            </label>
            <label className="text-xs muted">
              Tax (cents)
              <input className="input mt-1" value={taxCents} onChange={(e) => setTaxCents(toNumber(e.target.value, 0))} />
            </label>
            <label className="text-xs muted">
              Credits (cents)
              <input
                className="input mt-1"
                value={creditsCents}
                onChange={(e) => setCreditsCents(toNumber(e.target.value, 0))}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border bg-slate-50 p-4 text-xs overflow-auto" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="text-sm font-medium mb-2">Payload</div>
          <pre>{safeJsonString(payload)}</pre>
          <div className="mt-3">
            <button className="btn" type="button" onClick={() => copy(JSON.stringify(payload))}>
              Copy payload JSON
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-4 text-xs overflow-auto" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="text-sm font-medium mb-2">curl</div>
          <pre>{curl}</pre>

          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn" type="button" onClick={() => copy(curl)}>
              Copy curl
            </button>
            <button className="btn btn-primary" type="button" onClick={createIntent} disabled={creating || !product}>
              {creating ? "Creating…" : "Create PaymentIntent"}
            </button>
          </div>

          {result ? (
            <div className="mt-4 rounded-xl border bg-white p-3 text-sm" style={{ borderColor: "rgb(var(--border))" }}>
              {result.ok ? (
                <>
                  <div className="font-semibold">Success</div>
                  <div className="mt-1 text-xs muted">clientSecret:</div>
                  <div className="mt-1 font-mono text-xs break-all">{result.clientSecret}</div>
                  <button className="btn mt-3" type="button" onClick={() => copy(result.clientSecret)}>
                    Copy clientSecret
                  </button>
                </>
              ) : (
                <>
                  <div className="font-semibold">Error</div>
                  <div className="mt-1 text-sm muted">{result.error}</div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-xs muted">
        Manual option: browse <Link className="text-blue-600 hover:underline" href="/products">Products</Link> and open any item.
      </p>
    </div>
  );
}
