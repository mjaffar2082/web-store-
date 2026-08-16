import prisma from "../utils/prisma";
import { slugify } from "../utils/slugify";
import { NotFoundError, AppError } from "../utils/errors";
import { cacheGet, cacheSet, cacheDel } from "../utils/cache";
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from "../validators/product.validator";
import { CreateReviewInput } from "../validators/review.validator";
import { Prisma } from "@prisma/client";

const CACHE_KEY = "products:*";
const CACHE_TTL = 300;

async function collectDescendantSlugs(slug: string): Promise<string[]> {
  const slugs = [slug];
  const queue = [slug];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = await prisma.category.findMany({
      where: { parent: { slug: current }, isActive: true },
      select: { slug: true },
    });
    for (const child of children) {
      slugs.push(child.slug);
      queue.push(child.slug);
    }
  }

  return slugs;
}

export class ProductService {
  async findAll(query: ProductQueryInput) {
    const page = parseInt(query.page || "1", 10);
    const limit = Math.min(parseInt(query.limit || "20", 10), 100);
    const skip = (page - 1) * limit;

    const cacheKey = `products:list:${JSON.stringify(query)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (query.category) {
      const slugs = await collectDescendantSlugs(query.category);
      where.category = { slug: { in: slugs } };
    }
    if (query.brand) where.brand = { slug: query.brand };
    if (query.minPrice || query.maxPrice) {
      where.basePrice = {};
      if (query.minPrice) where.basePrice.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.basePrice.lte = parseFloat(query.maxPrice);
    }
    if (query.rating) {
      where.reviews = { some: { rating: { gte: parseInt(query.rating) } } };
    }
    if (query.inStock === "true") {
      where.stock = { gt: 0 };
    }
    if (query.q) {
      where.OR = [
        { name: { contains: query.q } },
        { description: { contains: query.q } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (query.sort) {
      case "price_asc": orderBy = { basePrice: "asc" }; break;
      case "price_desc": orderBy = { basePrice: "desc" }; break;
      case "name_asc": orderBy = { name: "asc" }; break;
      case "name_desc": orderBy = { name: "desc" }; break;
      case "popular": orderBy = { reviews: { _count: "desc" } }; break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const data = {
      data: products.map((p) => ({
        ...p,
        basePrice: Number(p.basePrice),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        rating: p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0,
        reviewCount: p.reviews.length,
        reviews: undefined,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await cacheSet(cacheKey, data, CACHE_TTL);
    return data;
  }

  async adminFindAll(query: { page?: string; limit?: string; q?: string; isActive?: string }) {
    const page = parseInt(query.page || "1", 10);
    const limit = Math.min(parseInt(query.limit || "20", 10), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (query.isActive === "true") where.isActive = true;
    if (query.isActive === "false") where.isActive = false;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q } },
        { description: { contains: query.q } },
        { sku: { contains: query.q } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        ...p,
        basePrice: Number(p.basePrice),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminFindById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { name: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
      },
    });

    if (!product) throw new NotFoundError("Product");

    return {
      ...product,
      basePrice: Number(product.basePrice),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    };
  }

  async findBySlug(slug: string) {
    const cacheKey = `products:slug:${slug}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: { where: { isActive: true } },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true, logo: true } },
        reviews: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!product || !product.isActive) throw new NotFoundError("Product");

    await cacheSet(cacheKey, product, CACHE_TTL);
    return product;
  }

  async search(q: string) {
    if (!q || q.length < 2) return [];

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: q },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        discountPrice: true,
        images: { orderBy: { order: "asc" }, take: 1, select: { url: true, alt: true } },
      },
      take: 10,
    });

    return products.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    }));
  }

  async create(data: CreateProductInput) {
    const slug = slugify(data.name);
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        specifications: data.specifications,
        basePrice: data.basePrice,
        discountPrice: data.discountPrice,
        discountStart: data.discountStart ? new Date(data.discountStart) : undefined,
        discountEnd: data.discountEnd ? new Date(data.discountEnd) : undefined,
        stock: data.stock,
        sku: data.sku,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        categoryId: data.categoryId,
        brandId: data.brandId,
        ...(data.images &&
          data.images.length > 0 && {
            images: {
              create: data.images.map((img, i) => ({
                url: img.url,
                alt: img.alt,
                order: img.order ?? i,
              })),
            },
          }),
      },
    });
    await cacheDel(CACHE_KEY);
    return product;
  }

  async update(id: string, data: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Product");

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name, slug: data.name !== existing.name ? slugify(data.name) : undefined }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.specifications !== undefined && { specifications: data.specifications }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.discountPrice !== undefined && { discountPrice: data.discountPrice }),
        ...(data.discountStart !== undefined && { discountStart: data.discountStart === null ? null : new Date(data.discountStart) }),
        ...(data.discountEnd !== undefined && { discountEnd: data.discountEnd === null ? null : new Date(data.discountEnd) }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDesc !== undefined && { metaDesc: data.metaDesc }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.brandId !== undefined && { brandId: data.brandId }),
        ...(data.images !== undefined && {
          images: {
            deleteMany: {},
            create: data.images.map((img, i) => ({
              url: img.url,
              alt: img.alt,
              order: img.order ?? i,
            })),
          },
        }),
      },
    });
    await cacheDel(CACHE_KEY);
    return product;
  }

  async softDelete(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Product");

    await prisma.product.update({ where: { id }, data: { isActive: false } });
    await cacheDel(CACHE_KEY);
  }

  async addReview(userId: string, slug: string, data: CreateReviewInput) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product || !product.isActive) throw new NotFoundError("Product");

    const existing = await prisma.review.findFirst({
      where: { userId, productId: product.id },
    });
    if (existing) {
      throw new AppError("You have already reviewed this product", 409);
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId: product.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    await cacheDel(CACHE_KEY);
    return review;
  }
}

export const productService = new ProductService();
