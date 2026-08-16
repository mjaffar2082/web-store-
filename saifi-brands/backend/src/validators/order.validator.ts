import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1).max(200),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(1).max(100),
  phone: z.string().max(30).optional(),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Cart is empty"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["stripe", "paypal", "cod"]).default("stripe"),
  email: z.string().email().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const orderQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  status: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;