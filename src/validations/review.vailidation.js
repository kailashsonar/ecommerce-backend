import mongoose from "mongoose";
import z from "zod";

export const createReviewSchema = z.object({
    body: z.object({
        product: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid MongoDB ID", }),
        rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').refine((n) => { // Convert to string and check if it matches "number" or "number.digit"
            return /^\d+(\.\d{1})?$/.test(n.toString())
        }, { message: 'Rating can only have up to one decimal place (e.g., 2.5)', }),
        comment: z.string().min(3).max(1000)
    })
});

export const updateReviewSchema =  z.object({
    body: z.object({
        rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').refine((n) => {
            return /^\d+(\.\d{1})?$/.test(n.toString())
        }, { message: 'Rating can only have up to one decimal place (e.g., 2.5)', }).optional(),
        comment: z.string().min(3).max(1000).optional()
    })
});

export const idValidationSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid MongoDB ID", })
  })
});