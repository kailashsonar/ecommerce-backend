import mongoose from "mongoose";
import z from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      fullName: z.string().min(1, "Full name is required"),
      phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      pincode: z.string().regex(/^\d{6}$/, "Invalid Pincode"),
    }).optional(),
    paymentMethod: z.string().toUpperCase().pipe(z.enum(["COD", "ONLINE"])),
    onDefaultAddress: z.boolean().optional()
  }).refine(
  (data) =>
    data.onDefaultAddress === true || data.shippingAddress,
  {
    message: "Either default address or shipping address is required",
    path: ["shippingAddress"]
  }
)
})

export const getOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
  })
});

export const idValidationSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid MongoDB ID", })
  })
});