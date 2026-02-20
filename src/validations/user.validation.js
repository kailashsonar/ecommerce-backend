import mongoose from "mongoose";
import z from "zod";

export const updateUserNameSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3, "Username must be at least 3 characters"),
  })
});  

export const addressSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(3, "Name must be at least 3 characters"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
    street: z.string().trim().min(3),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
    pincode: z.string().regex(/^\d{6}$/, "Invalid pincode")
  })
});

export const addressDeleteSchema = z.object({
 params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {message: "Invalid MongoDB ID", }),
 })  
});