import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service";
import { createProductSchema, updateProductSchema, productQuerySchema } from "../validators/product.validator";
import { createReviewSchema } from "../validators/review.validator";
import { AuthRequest } from "../types";

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = productQuerySchema.parse(req.query);
      const result = await productService.findAll(query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.findBySlug(String(req.params.slug));
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";
      const results = await productService.search(q);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }

  async adminGetAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: String(req.query.page || "1"),
        limit: String(req.query.limit || "20"),
        q: req.query.q ? String(req.query.q) : undefined,
        isActive: req.query.isActive ? String(req.query.isActive) : undefined,
      };
      const result = await productService.adminFindAll(query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async adminGetById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.adminFindById(String(req.params.id));
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await productService.create(data);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateProductSchema.parse(req.body);
      const product = await productService.update(String(req.params.id), data);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.softDelete(String(req.params.id));
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  async addReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createReviewSchema.parse(req.body);
      const review = await productService.addReview(req.user!.userId, String(req.params.slug), data);
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  }
}

export const productController = new ProductController();
