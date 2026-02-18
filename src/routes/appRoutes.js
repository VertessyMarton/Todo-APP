import express from "express"
import db from "../db.js"

const router = express.Router()

router.get("/", (req, res) => {
    const getTodos = db.prepare(`SELECT * FROM todos WHERE user_id = ?`)
    const todos = getTodos.all(req.userId)
    res.json({todos})
})

router.post("/", (req, res) => {
    const { task } = req.body

    if (!task) { return res.status(400).json({ error: "Task is empty" }) }

    const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES(?, ?)`)
    insertTodo.run(req.userId, task)
    res.json({ id: req.userId, task, completed: 0 })

})

router.put("/:id", (req, res) => {
    const { completed } = req.body
    const { id } = req.params

    if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "Invalid completed value" })
}

     const updateTodo = db.prepare(`UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?`)
     updateTodo.run(completed ? 1 : 0, id, req.userId)

     res.json({ message: "Completed status chenged" })
})

router.delete("/:id", (req, res) => {
    const { id } = req.params

    const deleteTodo = db.prepare(`DELETE FROM todos WHERE id = ? AND user_id = ?`)
    deleteTodo.run(id, req.userId)

    res.json({ message: "Todo deleted" })
})

export default router