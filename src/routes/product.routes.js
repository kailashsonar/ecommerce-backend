import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import { getProductsSchema, idProductSchema, pageValidationSchema, searchProductsSchema } from "../validations/product.validation.js";
import { getProduct, getProductReviews, getProducts, relatedProducts, searchProduct } from "../controllers/product.controller.js";

const router = Router();

router.get("/products", validate(getProductsSchema), getProducts);
router.get("/products/search", validate(searchProductsSchema), searchProduct);
router.get("/products/:id", validate(idProductSchema), getProduct);
router.get("/products/related/:id", validate(idProductSchema), relatedProducts);
router.get("/products/:id/reviews", validate(pageValidationSchema), validate(idProductSchema), getProductReviews)

export default router;