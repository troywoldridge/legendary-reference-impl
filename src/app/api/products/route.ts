import "server-only";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/db/schema";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { cfImageUrl } from "@/lib/images/cloudflare";

type ProductStatus = "draft" | "active" | "archived" | "all";

function toInt(v: string | null, fallback: number, max = 100) {
  const n = Number(v ?? "");
  if (!Number.isFinite(n)) return fallback;
  const m = Math.floor(n);
  if (m < 1) return fallback;
  return Math.min(m, max);
}

function parseStatus(v: string | null): ProductStatus {
  const s = (v ?? "").trim().toLowerCase();
  if (s === "draft" || s === "active" || s === "archived" || s === "all") return s;
  return "active";
}

function parseSort(v: string | null): "new" | "price_asc" | "price_desc" {
  const s = (v ?? "").trim().toLowerCase();
  if (s === "price_asc" || s === "price_desc" || s === "new") return s;
  return "new";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const page = toInt(url.searchParams.get("page"), 1, 9999);
  const limit = toInt(url.searchParams.get("limit"), 24, 100);
  const sort = parseSort(url.searchParams.get("sort"));
  const status = parseStatus(url.searchParams.get("status"));

  const where = and(
    status === "all" ? undefined : eq(products.status, status),
    q ? ilike(products.title, `%${q}%`) : undefined,
  );

  const orderBy =
    sort === "price_asc"
      ? sql`${products.priceCents} asc`
      : sort === "price_desc"
        ? sql`${products.priceCents} desc`
        : desc(products.createdAt);

  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      priceCents: products.priceCents,
      compareAtCents: products.compareAtCents,
      status: products.status,
      quantity: products.quantity,
      createdAt: products.createdAt,

      imageCount: sql<number>`(
        select count(*)::int
        from ${productImages} i
        where i.product_id = ${products.id}
      )`,

      // pull the "primary" image (lowest sort_order)
      primaryImageId: sql<string | null>`(
        select i.cf_image_id
        from ${productImages} i
        where i.product_id = ${products.id}
        order by i.sort_order asc
        limit 1
      )`,

      primaryAlt: sql<string | null>`(
        select i.alt
        from ${productImages} i
        where i.product_id = ${products.id}
        order by i.sort_order asc
        limit 1
      )`,
    })
    .from(products)
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const totalRow = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(products)
    .where(where);

  const items = rows.map((r) => {
    const primaryImageUrl = r.primaryImageId ? cfImageUrl(r.primaryImageId, "productTile") : null;
    return {
      ...r,
      primaryImageUrl,
      primaryAlt: r.primaryAlt,
    };
  });

  return NextResponse.json({
    items,
    page,
    limit,
    total: totalRow[0]?.total ?? 0,
  });
}
