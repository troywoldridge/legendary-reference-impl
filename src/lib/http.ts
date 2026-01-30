import "server-only";

import { headers } from "next/headers";

/**
 * Build an absolute base URL for server-side fetches.
 * Works in dev, PM2, reverse proxies, and port changes.
 */
async function getBaseUrl() {
  const h = await headers();

  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host");

  if (host) return `${proto}://${host}`;

  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/+$/, "");

  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
}

export async function serverFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = await getBaseUrl();

  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch failed ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }

  return (await res.json()) as T;
}
