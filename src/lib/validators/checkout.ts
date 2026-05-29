import { z } from "zod";

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.number().int().min(0),
});

export const checkoutSchema = z.object({
  guestEmail: z.string().email().optional(),
  recipientName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(5).max(30),
  streetAddress: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  deliveryZoneId: z.string().min(1),
  couponCode: z.string().trim().max(40).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
