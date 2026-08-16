import { Request, Response, NextFunction } from "express";
import { brandService } from "../services/brand.service";
import { createBrandSchema, updateBrandSchema } from "../validators/brand.validator";

export class BrandController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await brandService.findAll();
      res.json({ success: true, data: brands });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.findBySlug(String(req.params.slug));
      res.json({ success: true, data: brand });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createBrandSchema.parse(req.body);
      const brand = await brandService.create(data);
      res.status(201).json({ success: true, data: brand });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateBrandSchema.parse(req.body);
      const brand = await brandService.update(String(req.params.id), data);
      res.json({ success: true, data: brand });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await brandService.delete(String(req.params.id));
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }
}

export const brandController = new BrandController();
