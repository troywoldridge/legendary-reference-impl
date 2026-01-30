import "server-only";
import { z } from "zod";

export const CartLineSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
});

export const CreateIntentSchema = z.object({
  lines: z.array(CartLineSchema).min(1),
  shippingCents: z.number().int().min(0).max(50000).default(0),
  taxCents: z.number().int().min(0).max(50000).default(0),
  creditsCents: z.number().int().min(0).max(50000).default(0),
});

export type CreateIntentInput = z.infer<typeof CreateIntentSchema>;

export function clampNonNegative(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}
