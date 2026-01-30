import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Legendary Reference Implementation",
  description: "Public-safe full-stack demo: Next.js + Postgres/Drizzle + Clerk + Stripe + Merchant Feed.",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="btn btn-ghost px-3 py-2" href={href}>
      {children}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
          <div className="container-page flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white font-semibold">
                  L
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">Legendary</div>
                  <div className="text-xs muted -mt-0.5">Reference Impl</div>
                </div>
              </Link>

              <span className="hidden sm:inline-flex badge">Full-stack demo</span>
            </div>

            <nav className="flex items-center gap-1">
              <NavLink href="/products">Products</NavLink>
              <NavLink href="/cart">Cart</NavLink>
              <a className="btn btn-ghost px-3 py-2" href="/google/merchant-feed" target="_blank" rel="noreferrer">
                Merchant Feed
              </a>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-14 border-t bg-white">
          <div className="container-page py-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm muted">
                © {new Date().getFullYear()} Legendary Collectibles • Reference implementation (public-safe)
              </p>
              <div className="flex gap-2">
                <a className="btn" href="/api/products?limit=3&status=active" target="_blank" rel="noreferrer">
                  Products API
                </a>
                <a className="btn" href="/google/merchant-feed" target="_blank" rel="noreferrer">
                  Feed TSV
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
