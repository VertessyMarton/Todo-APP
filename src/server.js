import express from "express"
import authRoutes from "./routes/authRoutes.js"
import appRoutes from "./routes/appRoutes.js"
import authMiddleware from "./middleware/authMiddleware.js"
import cors from "cors";

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL || "*"
}))

app.get("/", (req, res) => {
  res.json({ ok: true, service: "todo-api" });
});

app.use("/auth", authRoutes)
app.use("/todos", authMiddleware, appRoutes)


app.listen(PORT, () => console.log(`Serves has started on port ${PORT}`))

