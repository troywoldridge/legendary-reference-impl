import "server-only";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { cfImageUrl } from "@/lib/images/cloudflare";

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  const p = await db.select().from(products).where(eq(products.slug, slug));
  if (!p[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const imgs = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, p[0].id))
    .orderBy(asc(productImages.sortOrder));

  return NextResponse.json({
    ...p[0],
    images: imgs.map((i) => ({
      id: i.id,
      alt: i.alt,
      sortOrder: i.sortOrder,
      url: cfImageUrl(i.cfImageId),
    })),
  });
}
