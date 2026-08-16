import prisma from "../utils/prisma";
import { slugify } from "../utils/slugify";
import { NotFoundError } from "../utils/errors";
import { cacheGet, cacheSet, cacheDel } from "../utils/cache";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";

const CACHE_KEY = "categories:*";
const CACHE_TTL = 600;

export class CategoryService {
  async findAll() {
    const cacheKey = "categories:all";
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { children: { where: { isActive: true } } },
      orderBy: { sortOrder: "asc" },
    });

    await cacheSet(cacheKey, categories, CACHE_TTL);
    return categories;
  }

  async findBySlug(slug: string) {
    const cacheKey = `categories:slug:${slug}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: { where: { isActive: true } },
        parent: true,
      },
    });

    if (!category) throw new NotFoundError("Category");

    const descendantSlugs = await this.collectDescendants(slug);
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        category: { slug: { in: descendantSlugs } },
      },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = {
      ...category,
      products: products.map((p) => ({
        ...p,
        basePrice: Number(p.basePrice),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        rating: p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0,
        reviewCount: p.reviews.length,
        reviews: undefined,
      })),
    };

    await cacheSet(cacheKey, result, CACHE_TTL);
    return result;
  }

  private async collectDescendants(slug: string): Promise<string[]> {
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

  async create(data: CreateCategoryInput) {
    const slug = slugify(data.name);
    const category = await prisma.category.create({ data: { ...data, slug } });
    await cacheDel(CACHE_KEY);
    return category;
  }

  async update(id: string, data: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Category");

    const updateData: Record<string, unknown> = { ...data };
    if (data.name && data.name !== existing.name) {
      updateData.slug = slugify(data.name);
    }

    const category = await prisma.category.update({ where: { id }, data: updateData });
    await cacheDel(CACHE_KEY);
    return category;
  }

  async delete(id: string) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Category");

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      await prisma.category.update({ where: { id }, data: { isActive: false } });
    } else {
      await prisma.category.delete({ where: { id } });
    }

    await cacheDel(CACHE_KEY);
  }
}

export const categoryService = new CategoryService();
