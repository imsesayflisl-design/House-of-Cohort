import { z } from "zod";

export const reviewInputSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
