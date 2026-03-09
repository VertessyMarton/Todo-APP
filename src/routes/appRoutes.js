import express from "express"
import prisma from "../prismaClient.js"
import {  
    insertTodoSchema,
    deleteTodoSchema,
    updateTodoSchema 
} from "./todoValidation.js"
import validate from "../middleware/validationMiddleware.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const todos = await prisma.todo.findMany({
        where: {
            userId: req.userId
        }
    })
    res.json({todos})
})

router.post("/", validate(insertTodoSchema), async (req, res) => {
    const { task } = req.body

    const insertTodo = await prisma.todo.create({
        data: {
            task,
            userId: req.userId
        }
    })
    res.json(insertTodo)

})

router.put("/:id", validate(updateTodoSchema), async (req, res) => {
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

router.delete("/:id", validate(deleteTodoSchema), async (req, res) => {
    const { id } = req.params
    const userId = req.userId

    await prisma.todo.delete({
        where: {
            id: id,
            userId
        }
    })

    res.json({ message: "Todo deleted" })
})

export default router