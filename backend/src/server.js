import express from "express"
import authRoutes from "./routes/authRoutes.js"
import todoRoutes from "./routes/todoRoutes.js"
import todoListRoutes from "./routes/todoListRoutes.js"
import authMiddleware from "./middleware/authMiddleware.js"
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";
import cookieParser from "cookie-parser"
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prisma from "./prismaClient.js"

const app = express()
const PORT = process.env.PORT || 3000
const frontendDirectory = fileURLToPath(
  new URL('../public/', import.meta.url),
);

const healthCheckResponse = {
    ok: true,
    service: "todo-api"
}

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}))

app.use(express.json())

app.use(cookieParser())

app.get("/api/health", (req, res) => {
  res.json(healthCheckResponse);
});

app.get("/api/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      ...healthCheckResponse,
      database: "up",
    });
  } catch (error) {
    console.error("Database healthcheck failed: ", error)

    res.status(503).json({
      ok: false,
      service: "todo-api",
      database: "down",
    });
  }
});

app.use("/api/auth", authRoutes)
app.use("/api/todos", authMiddleware, todoRoutes)
app.use("/api/lists", authMiddleware, todoListRoutes)

app.use('/api', (req, res, next) => {
    next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(frontendDirectory));

    app.get('/{*splat}', (req, res, next) => {
        if (!req.accepts('html') || path.extname(req.path)) {
            return next();
        }

        res.sendFile(path.join(frontendDirectory, 'index.html'));
    });
}

app.use((req, res, next) => {
    next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler)


app.listen(PORT, () => console.log(`Server has started on port ${PORT}`))

