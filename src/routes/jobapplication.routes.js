import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import { jobApplicationSchema } from "../validations/jobapplication.validation.js";
import { createJobapplication } from "../controllers/jobapplication.controller.js";

const router = Router();

router.post("/", validate(jobApplicationSchema), createJobapplication);

export default router;