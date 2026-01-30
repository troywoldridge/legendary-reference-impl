import "server-only";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { cfImageUrl } from "@/lib/images/cloudflare";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteUrl(pathname: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

function tsvEscape(v: string) {
  return v.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

export async function GET() {
  const active = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      priceCents: products.priceCents,
      quantity: products.quantity,
      brand: products.brand,
      imageId: sql<string | null>`(
        select i.cf_image_id from ${productImages} i
        where i.product_id = ${products.id}
        order by i.sort_order asc
        limit 1
      )`,
    })
    .from(products)
    .where(eq(products.status, "active"));

  const header = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
    "brand",
    "condition",
  ].join("\t");

  const lines = active.map((p) => {
    const link = siteUrl(`/products/${p.slug}`);
    const img = p.imageId ? cfImageUrl(p.imageId) : null;
    const availability = p.quantity > 0 ? "in stock" : "out of stock";
    const price = `${(p.priceCents / 100).toFixed(2)} USD`;

    return [
      p.id,
      tsvEscape(p.title),
      tsvEscape("Public-safe demo product listing."),
      link,
      img || "",
      availability,
      price,
      tsvEscape(p.brand || "Legendary Collectibles"),
      "new",
    ].join("\t");
  });

  const body = [header, ...lines].join("\n");

  return new NextResponse(body, {
    headers: {
      "content-type": "text/tab-separated-values; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
