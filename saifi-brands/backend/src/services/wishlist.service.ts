import prisma from "../utils/prisma";
import { NotFoundError } from "../utils/errors";

export class WishlistService {
  async getWishlist(userId: string) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            discountPrice: true,
            stock: true,
            isActive: true,
            images: { orderBy: { order: "asc" as const }, take: 1 },
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
          },
        },
      },
    });

    return items.map((i) => ({
      id: i.id,
      createdAt: i.createdAt,
      product: {
        ...i.product,
        basePrice: Number(i.product.basePrice),
        discountPrice: i.product.discountPrice ? Number(i.product.discountPrice) : null,
      },
    }));
  }

  async addItem(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError("Product");

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!existing) {
      await prisma.wishlistItem.create({ data: { userId, productId } });
    }
    return this.getWishlist(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await prisma.wishlistItem.findFirst({ where: { id: itemId, userId } });
    if (!item) throw new NotFoundError("Wishlist item");
    await prisma.wishlistItem.delete({ where: { id: itemId } });
    return this.getWishlist(userId);
  }

  async removeByProduct(userId: string, productId: string) {
    await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    return this.getWishlist(userId);
  }

  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!item;
  }
}

export const wishlistService = new WishlistService();