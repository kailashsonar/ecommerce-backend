import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createReviewSchema, idValidationSchema, updateReviewSchema } from "../validations/review.vailidation.js";
import { createReview, deleteReview, updateReview } from "../controllers/review.controller.js";

const router = Router();

router.post("/", verifyJwt, validate(createReviewSchema), createReview);
router.patch("/:id", verifyJwt, validate(idValidationSchema), validate(updateReviewSchema), updateReview);
router.delete("/:id", verifyJwt, validate(idValidationSchema), deleteReview);

export default router;