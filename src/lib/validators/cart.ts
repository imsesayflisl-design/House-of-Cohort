import { z } from "zod";

export const cartAddSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).optional(),
});

export const cartUpdateSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
});

export const cartRemoveSchema = z.object({
  variantId: z.string().min(1),
});

export type CartAddInput = z.infer<typeof cartAddSchema>;
export type CartUpdateInput = z.infer<typeof cartUpdateSchema>;
