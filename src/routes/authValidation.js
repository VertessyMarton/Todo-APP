import { z } from "zod"

export const registerSchema = z.object({
    body: z.object({
        username: z.string().trim().min(3),
        password: z.string().min(8),
        confirmPassword : z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
})

export const loginSchema = z.object({
    body: z.object({
        username: z.string().trim().min(3),
        password: z.string().min(8)
    })
})