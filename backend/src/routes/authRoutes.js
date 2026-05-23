import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../prismaClient.js"
import AppError from "../utils/AppError.js"
import validate from "../middleware/validationMiddleware.js"
import { registerSchema, loginSchema } from "./authValidation.js"
import { LoginLimit, RegisterLimit } from "../middleware/rateLimitMiddleware.js"


const router = express.Router()

router.post("/register", validate(registerSchema), RegisterLimit, async (req, res) => {
    const { username, password } = req.body

    const hashedPassword = bcrypt.hashSync(password, 8) 

    await prisma.user.create({
        data: {
            username: username,
            password: hashedPassword
        }
    })

    return res.status(201).json({ message: "User registered successfully" })
})

router.post("/login", validate(loginSchema), LoginLimit, async (req, res) => {
    const {username, password} = req.body

    const user = await prisma.user.findUnique({
         where: {
             username: username
        }
    })

    if (!user) { throw AppError.unauthorized("Invalid credentials") }

    const passwordIsValid = bcrypt.compareSync(password, user.password)

    if (!passwordIsValid) { throw AppError.unauthorized("Invalid credentials") }

    if (passwordIsValid) { 
        const accessToken = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: "1h"})
        return res.json({ accessToken })
    }
})


export default router