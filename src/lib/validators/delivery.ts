import { z } from "zod";

export const deliveryZoneCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fee: z.number().int().min(0, "Fee cannot be negative"),
  isActive: z.boolean(),
});

export const deliveryZoneUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  fee: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type DeliveryZoneCreate = z.infer<typeof deliveryZoneCreateSchema>;
export type DeliveryZoneUpdate = z.infer<typeof deliveryZoneUpdateSchema>;
