import express from "express"
import * as authService from "../services/authService.js"
import validate from "../middleware/validationMiddleware.js"
import { registerSchema, loginSchema } from "./authValidation.js"
import { LoginLimit, RegisterLimit } from "../middleware/rateLimitMiddleware.js"

const router = express.Router()

router.post("/register", validate(registerSchema), RegisterLimit, async (req, res) => {
    await authService.register(req.body)
    return res.status(201).json({ message: "User registered successfully" })
})

router.post("/login", validate(loginSchema), LoginLimit, async (req, res) => {
    const result = await authService.login(req.body)
    return res.json(result)
})

export default router
