import express from "express"
import * as todoService from "../services/todoService.js"
import {  
    insertTodoSchema,
    deleteTodoSchema,
    updateTodoSchema, 
    moveTodoSchema
} from "./todoValidation.js"
import validate from "../middleware/validationMiddleware.js"
import { MutationLimit, ReadLimit } from "../middleware/rateLimitMiddleware.js"
import { z } from "zod"

const router = express.Router()
const getTodosQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(15),
    cursor: z.coerce.number().int().positive().optional(),
    status: z.enum(["all", "active", "done"]).default("all"),
    listId: z.coerce.number().int().positive().optional(),
})

router.get("/", ReadLimit, async (req, res) => {
    const query = getTodosQuerySchema.parse(req.query)
    const result = await todoService.getTodos(req.userId, query)
    res.json(result)
})

router.post("/", validate(insertTodoSchema), MutationLimit, async (req, res) => {
    const todo = await todoService.createTodo(req.userId, req.body)
    res.json(todo)
})

router.put("/:id", validate(updateTodoSchema), MutationLimit, async (req, res) => {
    const todo = await todoService.updateTodo(req.userId, parseInt(req.params.id), req.body)
    res.json(todo)
})

router.delete("/:id", validate(deleteTodoSchema), MutationLimit, async (req, res) => {
    await todoService.deleteTodo(req.userId, parseInt(req.params.id))
    res.json({ message: "Todo deleted" })
})

router.patch("/:id", validate(moveTodoSchema), MutationLimit, async (req, res) => {
    const todo = await todoService.moveTodo(req.userId, parseInt(req.params.id), req.body)
    res.json(todo)
})

export default router
