import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

const router = Router();

router.get("/", categoryController.getAll.bind(categoryController));
router.get("/:slug", categoryController.getBySlug.bind(categoryController));
router.post("/", authenticate, authorize("ADMIN"), validate(createCategorySchema), categoryController.create.bind(categoryController));
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateCategorySchema), categoryController.update.bind(categoryController));
router.delete("/:id", authenticate, authorize("ADMIN"), categoryController.delete.bind(categoryController));

export default router;
