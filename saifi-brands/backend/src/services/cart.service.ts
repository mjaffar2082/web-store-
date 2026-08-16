import prisma from "../utils/prisma";
import { AppError, NotFoundError } from "../utils/errors";
import { AddToCartInput, UpdateCartItemInput } from "../validators/cart.validator";

const itemInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      basePrice: true,
      discountPrice: true,
      stock: true,
      isActive: true,
      images: { orderBy: { order: "asc" as const }, take: 1 },
    },
  },
  variant: true,
};

function serializeItem(item: any) {
  const price = item.variant?.price
    ? Number(item.variant.price)
    : Number(item.product.discountPrice ?? item.product.basePrice);
  return {
    id: item.id,
    quantity: item.quantity,
    productId: item.productId,
    variantId: item.variantId,
    variant: item.variant
      ? { id: item.variant.id, name: item.variant.name, type: item.variant.type, sku: item.variant.sku, price: Number(item.variant.price ?? 0), stock: item.variant.stock }
      : null,
    name: item.product.name,
    slug: item.product.slug,
    sku: item.variant?.sku ?? item.product.sku,
    image: item.product.images[0]?.url ?? null,
    price,
    unitPrice: price,
    stock: item.variant ? item.variant.stock : item.product.stock,
    available: item.product.isActive && (item.variant ? item.variant.stock > 0 : item.product.stock > 0),
  };
}

export class CartService {
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: itemInclude } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: itemInclude } },
      });
    }

    const items = cart.items.map(serializeItem);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return {
      id: cart.id,
      items,
      subtotal,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }

  async addItem(userId: string, data: AddToCartInput) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) throw new NotFoundError("Product");

    let variant = null;
    if (data.variantId) {
      variant = product.variants.find((v) => v.id === data.variantId && v.isActive);
      if (!variant) throw new NotFoundError("Variant");
      if (variant.stock < data.quantity) {
        throw new AppError(`Only ${variant.stock} of this option available`, 400);
      }
    } else if (product.stock < data.quantity) {
      throw new AppError(`Only ${product.stock} available in stock`, 400);
    }

    const cart = await this.getOrCreateCartRaw(userId);

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId ?? null,
      },
    });

    if (existing) {
      const newQuantity = existing.quantity + data.quantity;
      const maxStock = variant ? variant.stock : product.stock;
      if (newQuantity > maxStock) {
        throw new AppError(`Only ${maxStock} of this item are available`, 400);
      }
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQuantity } });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId ?? null,
          quantity: data.quantity,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async updateItem(userId: string, itemId: string, data: UpdateCartItemInput) {
    const cart = await this.getOrCreateCartRaw(userId);
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true, variant: true },
    });
    if (!item) throw new NotFoundError("Cart item");

    const maxStock = item.variant ? item.variant.stock : item.product.stock;
    if (data.quantity > maxStock) {
      throw new AppError(`Only ${maxStock} of this item are available`, 400);
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: data.quantity } });
    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCartRaw(userId);
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundError("Cart item");
    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCartRaw(userId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getOrCreateCart(userId);
  }

  private async getOrCreateCartRaw(userId: string) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    return cart;
  }
}

export const cartService = new CartService();