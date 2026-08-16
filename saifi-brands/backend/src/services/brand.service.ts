import prisma from "../utils/prisma";
import { slugify } from "../utils/slugify";
import { NotFoundError } from "../utils/errors";
import { cacheGet, cacheSet, cacheDel } from "../utils/cache";
import { CreateBrandInput, UpdateBrandInput } from "../validators/brand.validator";

const CACHE_KEY = "brands:*";
const CACHE_TTL = 600;

export class BrandService {
  async findAll() {
    const cacheKey = "brands:all";
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    await cacheSet(cacheKey, brands, CACHE_TTL);
    return brands;
  }

  async findBySlug(slug: string) {
    const cacheKey = `brands:slug:${slug}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
          },
        },
      },
    });

    if (!brand) throw new NotFoundError("Brand");

    await cacheSet(cacheKey, brand, CACHE_TTL);
    return brand;
  }

  async create(data: CreateBrandInput) {
    const slug = slugify(data.name);
    const brand = await prisma.brand.create({ data: { ...data, slug } });
    await cacheDel(CACHE_KEY);
    return brand;
  }

  async update(id: string, data: UpdateBrandInput) {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Brand");

    const updateData: Record<string, unknown> = { ...data };
    if (data.name && data.name !== existing.name) {
      updateData.slug = slugify(data.name);
    }

    const brand = await prisma.brand.update({ where: { id }, data: updateData });
    await cacheDel(CACHE_KEY);
    return brand;
  }

  async delete(id: string) {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Brand");

    await prisma.brand.delete({ where: { id } });
    await cacheDel(CACHE_KEY);
  }
}

export const brandService = new BrandService();
