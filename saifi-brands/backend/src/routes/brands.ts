import { Router } from "express";
import { brandController } from "../controllers/brand.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createBrandSchema, updateBrandSchema } from "../validators/brand.validator";

const router = Router();

router.get("/", brandController.getAll.bind(brandController));
router.get("/:slug", brandController.getBySlug.bind(brandController));
router.post("/", authenticate, authorize("ADMIN"), validate(createBrandSchema), brandController.create.bind(brandController));
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateBrandSchema), brandController.update.bind(brandController));
router.delete("/:id", authenticate, authorize("ADMIN"), brandController.delete.bind(brandController));

export default router;
