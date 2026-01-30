export function cfImageUrl(imageIdOrUrl: string, variant?: string) {
  const raw = String(imageIdOrUrl || "").trim();
  if (!raw) return null;

  // Local public asset path
  if (raw.startsWith("/")) return raw;

  // Full URL stored in DB
  if (/^https?:\/\//i.test(raw)) return raw;

  // Otherwise treat as Cloudflare Images ID
  const base = process.env.CLOUDFLARE_IMAGE_DELIVERY_BASE;
  const v = variant || process.env.CLOUDFLARE_IMAGE_VARIANT || "public";
  if (!base) return null;

  return `${base}/${raw}/${v}`;
}
