import mongoose from "mongoose";
import z from "zod";

export const idValidationSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid MongoDB ID", })
  })
});

export const addToCartSchema = z.object({
    body: z.object({
        product: z
            .string()
            .refine((val) => mongoose.Types.ObjectId.isValid(val), {
                message: "Invalid MongoDB ID",
            }),
        quantity: z.coerce.number().int().positive(),
        size: z.string(),
        color: z.string(),
    })
});

export const updateCartSchema = z.object({
    body: z.object({
        action: z.string().toUpperCase().pipe(z.enum(["INCREMENT", "DECREMENT"])),
        size: z.string(),
        color: z.string(),
    })
});

export const removeCartItemSchema = z.object({
    body: z.object({
        size: z.string(),
        color: z.string(),
    })
});