# Legendary Reference Implementation

A **public, production-style reference implementation** demonstrating how to build a modern,
full-stack e-commerce application using **Next.js, PostgreSQL, Drizzle ORM, and Stripe**.

This repo is intentionally **public-safe**: it uses seeded demo data, local images, and no proprietary credentials.

---

## ✨ What This Demo Shows

- Full **Next.js App Router** setup (server + client components)
- PostgreSQL schema + queries via **Drizzle ORM**
- Real Stripe **PaymentIntent** creation (server-side totals)
- Product catalog with images, pricing, and stock
- Clean API routes (`/api/products`, `/api/create-payment-intent`)
- Public-safe demo seeding with realistic data
- Designed to run locally in minutes

This is the same architectural style used in real production stores — just stripped down and safe to share.

---

## 🧱 Tech Stack

- **Next.js** (App Router)
- **Node.js**
- **PostgreSQL**
- **Drizzle ORM**
- **Stripe**
- **pnpm**
- **Tailwind CSS**
- **PM2** (optional production-style runner)

---

## 📸 Demo Screens

> Screenshots intentionally omitted here — run locally to see the full UI:
>
> - `/products` → product grid with images
> - `/products/[slug]` → product detail view
> - `/cart` → live Stripe PaymentIntent demo

---

## 🚀 Getting Started

### 1) Clone the repo

```bash
git clone https://github.com/troywoldridge/legendary-reference-impl.git
cd legendary-reference-impl
pnpm install
