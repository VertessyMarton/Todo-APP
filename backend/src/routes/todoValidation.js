import { z } from "zod"

export const insertTodoSchema = z.object({
    body: z.object({
        task: z.string().trim().min(3),
        listId: z.coerce.number().int().positive()
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

export const moveTodoSchema = z.object({
    body: z.object({
        listId: z.coerce.number().int().positive()
    }),
    params: z.object({
        id: z.coerce.number().int().positive()
    }),
})

export const createTodoListSchema = z.object({
    body: z.object({
        name: z.string().trim().min(3).max(100)
    })
})

export const updateTodoListSchema = z.object({
    body: z.object({
        name: z.string().trim().min(3).max(100)
    }),
    params: z.object({
        id: z.coerce.number().int().positive()
    }),
})

export const deleteTodoListSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive()
    })
})