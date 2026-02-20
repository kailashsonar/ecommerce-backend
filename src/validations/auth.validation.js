import z from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3, "Username must be at least 3 characters"),
    email: z.string().trim().email("Invalid email format").transform(val => val.toLowerCase()),
    password: z.string().trim().min(8, "Password too short at leaset 8 characters needed").max(64, "Password must be less than 64 characters"),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email format").transform(val => val.toLowerCase()),
    password: z.string().trim().min(8, "Password too short at leaset 8 characters needed").max(64, "Password must be less than 64 characters"),
  })
});

export const chengePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().trim().min(8, "Password too short at leaset 8 characters needed").max(64, "Password must be less than 64 characters"),
    newPassword: z.string().trim().min(8, "Password too short at leaset 8 characters needed").max(64, "Password must be less than 64 characters"),
  })
});

export const otpSchema = z.object({
  body: z.object({
    otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
    email: z.string().trim().email("Invalid email format").transform(val => val.toLowerCase()),
  })
});

export const emailOnlySchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email format").transform(val => val.toLowerCase()),
  })
});


export const resetPasswordSchema = z.object({
  body: z.object({
    otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
    email: z.string().trim().email("Invalid email format").transform(val => val.toLowerCase()),
    newPassword: z.string().trim().min(8, "Password too short at leaset 8 characters needed").max(64, "Password must be less than 64 characters"),
  })
});
