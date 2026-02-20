import { z } from "zod";

export const jobApplicationSchema = z.object({
    body: z.object({
        interestedInJob: z.enum([
            "FRONTEND_DEVELOPER",
            "BACKEND_DEVELOPER",
            "FULLSTACK_DEVELOPER",
            "MOBILE_APP_DEVELOPER",
            "QA_TESTER",
            "UI_UX_DESIGNER",
            "DEVOPS_ENGINEER",
            "INTERN",
            "OTHER"
        ]),
        otherRole: z.string().trim().optional(),
        name: z.string().trim().min(1, "Name is required"),
        email: z.string().trim().email("Invalid email address"),
        currentCity: z.string().trim().min(1, "Current city is required"),
        experience: z.coerce.number({ required_error: "Experience is required" }).min(0, "Experience cannot be negative"),
    })
});