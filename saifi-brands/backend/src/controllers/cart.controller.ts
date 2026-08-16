import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { cartService } from "../services/cart.service";
import { addToCartSchema, updateCartItemSchema } from "../validators/cart.validator";

export class CartController {
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.getOrCreateCart(req.user!.userId);
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addToCartSchema.parse(req.body);
      const cart = await cartService.addItem(req.user!.userId, data);
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateCartItemSchema.parse(req.body);
      const cart = await cartService.updateItem(req.user!.userId, String(req.params.id), data);
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }

  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.removeItem(req.user!.userId, String(req.params.id));
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }

  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.clearCart(req.user!.userId);
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }
}

export const cartController = new CartController();