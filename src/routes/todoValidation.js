import { z } from "zod"

export const insertTodoSchema = z.object({
    body: z.object({
        task: z.string().min(3).trim()
    })
})

export const updateTodoSchema = z.object({
    body: z.object({
        completed: z.boolean()
    }),
    params: z.object({
        id: z.coerce.number().int().positive()
    }),
})

export const deleteTodoSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive()
    })
})