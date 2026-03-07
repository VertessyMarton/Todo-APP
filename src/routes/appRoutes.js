import express from "express"
import prisma from "../prismaClient.js"
import AppError from "../utils/AppError.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const todos = await prisma.todo.findMany({
        where: {
            userId: req.userId
        }
    })
    res.json({todos})
})

router.post("/", async (req, res) => {
    const { task } = req.body

    if (!task) { return res.status(400).json({ error: "Task is empty" }) }

    const insertTodo = await prisma.todo.create({
        data: {
            task,
            userId: req.userId
        }
    })
    res.json(insertTodo)

})

router.put("/:id", async (req, res) => {
    const { completed } = req.body
    const { id } = req.params

    if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "Invalid completed value" })
}

      const updatedTodo = await prisma.todo.update({
        where: {
            id: parseInt(id),
            userId: req.userId
        },
        data: {
            completed: !!completed
        }
    })

     res.json(updatedTodo)
})

router.delete("/:id", async (req, res) => {
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