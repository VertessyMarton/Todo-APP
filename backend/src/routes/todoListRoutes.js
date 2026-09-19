import express from "express"
import * as todoListService from "../services/todoListService.js"
import {  
    createTodoListSchema,
    updateTodoListSchema, 
    deleteTodoListSchema
} from "./todoValidation.js"
import validate from "../middleware/validationMiddleware.js"
import { MutationLimit, ReadLimit } from "../middleware/rateLimitMiddleware.js"

const router = express.Router()

router.get("/", ReadLimit, async (req, res) => {
    const result = await todoListService.getTodoList(req.userId)
    res.json(result)
})

router.post("/", validate(createTodoListSchema), MutationLimit, async (req, res) => {
    const todo = await todoListService.createTodoList(req.userId, req.body)
    res.json(todo)
})

router.put("/:id", validate(updateTodoListSchema), MutationLimit, async (req, res) => {
    const todo = await todoListService.updateTodoList(parseInt(req.params.id), req.userId, req.body)
    res.json(todo)
})

router.delete("/:id", validate(deleteTodoListSchema) ,MutationLimit, async (req, res) => {
    await todoListService.deleteTodoList(req.userId, parseInt(req.params.id))
    res.json({ message: "TodoList deleted" })
})

export default router
