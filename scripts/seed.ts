import "dotenv/config";

import { db } from "@/lib/db";
import { categories, products, productImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const LOCAL_IMAGES = [
  "/demo/products/1.jpg",
  "/demo/products/2.jpg",
  "/demo/products/3.jpg",
  "/demo/products/4.jpg",
  "/demo/products/5.jpg",
  "/demo/products/6.jpg",
  "/demo/products/7.jpg",
];

async function main() {
  const catSlug = "funko";

  const existing = await db.select().from(categories).where(eq(categories.slug, catSlug));
  const category =
    existing[0] ??
    (
      await db
        .insert(categories)
        .values({ name: "Funko", slug: catSlug })
        .returning()
    )[0];

  const items = Array.from({ length: 30 }).map((_, i) => {
    const title = `Demo Collectible #${i + 1}`;
    return {
      categoryId: category.id,
      title,
      slug: slugify(title),
      description: "Public-safe demo product used to showcase full-stack patterns.",
      brand: "Legendary Collectibles",
      priceCents: 1299 + i * 50,
      compareAtCents: i % 3 === 0 ? 1699 + i * 50 : null,
      quantity: 10 + (i % 5),
      status: i % 4 === 0 ? "draft" : "active",
    } as const;
  });

  await db.insert(products).values(items).onConflictDoNothing();

  const all = await db.select().from(products).where(eq(products.categoryId, category.id));

  // OVERWRITE images for each product so they never get cross-wired
  for (let idx = 0; idx < all.length; idx++) {
    const p = all[idx];
    const a = LOCAL_IMAGES[idx % LOCAL_IMAGES.length];
    const b = LOCAL_IMAGES[(idx + 1) % LOCAL_IMAGES.length];

    await db.delete(productImages).where(eq(productImages.productId, p.id));

    await db.insert(productImages).values([
      { productId: p.id, cfImageId: a, alt: `${p.title} photo 1`, sortOrder: 1 },
      { productId: p.id, cfImageId: b, alt: `${p.title} photo 2`, sortOrder: 2 },
    ]);
  }

  console.log(`Seeded: ${all.length} products, ${all.length * 2} images`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
