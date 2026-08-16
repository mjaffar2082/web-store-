import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";

const router = Router();

router.get("/search", productController.search.bind(productController));
router.get("/admin/:id", authenticate, authorize("ADMIN"), productController.adminGetById.bind(productController));
router.get("/admin", authenticate, authorize("ADMIN"), productController.adminGetAll.bind(productController));
router.get("/", productController.getAll.bind(productController));
router.get("/:slug", productController.getBySlug.bind(productController));
router.post("/:slug/reviews", authenticate, productController.addReview.bind(productController));
router.post("/", authenticate, authorize("ADMIN"), validate(createProductSchema), productController.create.bind(productController));
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateProductSchema), productController.update.bind(productController));
router.delete("/:id", authenticate, authorize("ADMIN"), productController.delete.bind(productController));

export default router;
