import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service";
import { validate } from "../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

export class CategoryController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.findAll();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.findBySlug(String(req.params.slug));
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCategorySchema.parse(req.body);
      const category = await categoryService.create(data);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateCategorySchema.parse(req.body);
      const category = await categoryService.update(String(req.params.id), data);
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.delete(String(req.params.id));
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }
}

export const categoryController = new CategoryController();
