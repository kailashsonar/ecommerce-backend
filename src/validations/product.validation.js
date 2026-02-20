import z from "zod";
import mongoose from "mongoose";

const idValidation = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ID",
  });

export const getProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),

    category: z
      .preprocess((val) => {
        if (typeof val === "string") return [val]; 
        return val; 
      }, z.array(idValidation).optional()),

    sizes: z
      .preprocess((val) => {
        if (typeof val === "string") return [val]; 
        return val; 
      }, z.array(z.string()).optional()),

    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    rating: z.coerce.number().min(1).max(5).optional(),
    discount: z.coerce.number().min(0).max(100).optional(),
  }),
});

export const searchProductsSchema =  z.object({
  query: z.object({
    search: z.string().min(2),
    page: z.coerce.number().min(1).optional()
  })
});

export const idProductSchema = z.object({
  params: z.object({
    id: idValidation
  }),
});

export const pageValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
  })
});

