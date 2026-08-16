import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().min(1).max(2000),
  alt: z.string().max(200).optional(),
  order: z.number().int().min(0).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  basePrice: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  discountStart: z.string().datetime().optional(),
  discountEnd: z.string().datetime().optional(),
  stock: z.number().int().min(0).default(0),
  sku: z.string().min(1).max(50),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  images: z.array(productImageSchema).max(12).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  basePrice: z.number().positive().optional(),
  discountPrice: z.number().positive().nullable().optional(),
  discountStart: z.string().datetime().nullable().optional(),
  discountEnd: z.string().datetime().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDesc: z.string().max(500).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  images: z.array(productImageSchema).max(12).optional(),
});

export const productQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  sort: z.enum(["newest", "price_asc", "price_desc", "name_asc", "name_desc", "popular"]).optional().default("newest"),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  rating: z.string().optional(),
  inStock: z.string().optional(),
  q: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
