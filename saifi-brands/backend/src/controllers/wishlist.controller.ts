import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { wishlistService } from "../services/wishlist.service";
import { wishlistSchema } from "../validators/wishlist.validator";

export class WishlistController {
  async getWishlist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const items = await wishlistService.getWishlist(req.user!.userId);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = wishlistSchema.parse(req.body);
      const items = await wishlistService.addItem(req.user!.userId, data.productId);
      res.status(201).json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const items = await wishlistService.removeItem(req.user!.userId, String(req.params.id));
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  async removeByProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const items = await wishlistService.removeByProduct(req.user!.userId, String(req.params.productId));
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }
}

export const wishlistController = new WishlistController();