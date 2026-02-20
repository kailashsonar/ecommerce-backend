import z from "zod";

export const createContactSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        message: z.string().min(5).max(1000),
        email: z.string().trim().email("Invalid email format").transform(val => val.toLowerCase()),
    })
});