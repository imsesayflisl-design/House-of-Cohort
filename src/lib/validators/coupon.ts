import { z } from "zod";
import { CouponType } from "@/generated/prisma/enums";

const TYPES = Object.values(CouponType) as [CouponType, ...CouponType[]];

export const couponCreateSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and hyphens only"),
    type: z.enum(TYPES),
    value: z.number().int().positive(),
    minOrder: z.number().int().min(0).nullable().optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (v) => v.type !== "PERCENTAGE" || (v.value >= 1 && v.value <= 100),
    {
      path: ["value"],
      message: "Percentage must be between 1 and 100",
    },
  );

export type CouponCreate = z.infer<typeof couponCreateSchema>;

export const couponUpdateSchema = z.object({
  type: z.enum(TYPES).optional(),
  value: z.number().int().positive().optional(),
  minOrder: z.number().int().min(0).nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CouponUpdate = z.infer<typeof couponUpdateSchema>;
