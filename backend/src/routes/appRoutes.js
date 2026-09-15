import express from "express"
import prisma from "../prismaClient.js"
import {  
    insertTodoSchema,
    deleteTodoSchema,
    updateTodoSchema 
} from "./todoValidation.js"
import validate from "../middleware/validationMiddleware.js"
import { MutationLimit, ReadLimit } from "../middleware/rateLimitMiddleware.js"
import { z } from "zod"

const router = express.Router()
const getTodosQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(15),
    cursor: z.coerce.number().int().positive().optional(),
    status: z.enum(["all", "active", "done"]).default("all"),
})

router.get("/", ReadLimit ,async (req, res) => {
    const { limit, cursor, status } = getTodosQuerySchema.parse(req.query)

    const todos = await prisma.todo.findMany({
        where: {
            userId: req.userId,
            ...(status !== "all" && { completed: status === "done" }),
            ...(cursor !== undefined && { id: { lt: cursor } }),
        },
        orderBy: {
            id: "desc",
        },
        take: limit + 1,
    })

    const hasMore = todos.length > limit
    const pageTodos = hasMore ? todos.slice(0, limit) : todos
    const nextCursor = hasMore
        ? pageTodos[pageTodos.length - 1].id
        : null

    res.json({
        todos: pageTodos,
        nextCursor,
        hasMore,
    })
})

router.post("/", validate(insertTodoSchema), MutationLimit, async (req, res) => {
    const { task } = req.body

    const insertTodo = await prisma.todo.create({
        data: {
            task,
            userId: req.userId
        }
    })
    res.json(insertTodo)

})

router.put("/:id", validate(updateTodoSchema), MutationLimit, async (req, res) => {
    const { completed } = req.body
    const { id } = req.params

      const updatedTodo = await prisma.todo.update({
        where: {
            id: parseInt(id),
            userId: req.userId
        },
        data: {
            completed: completed
        }
    })

     res.json(updatedTodo)
})

router.delete("/:id", validate(deleteTodoSchema), MutationLimit, async (req, res) => {
    const { id } = req.params
    const userId = req.userId

    await prisma.todo.delete({
        where: {
            id: parseInt(id),
            userId
        }
    })

    res.json({ message: "Todo deleted" })
})

export default router
