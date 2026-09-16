import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../prismaClient.js"
import AppError from "../utils/AppError.js"

export async function register({ username, password }) {
    const hashedPassword = bcrypt.hashSync(password, 8)

    await prisma.user.create({
        data: {
            username,
            password: hashedPassword
        }
    })
}

export async function login({ username, password }) {
    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user) { throw AppError.unauthorized("Invalid credentials") }

    const passwordIsValid = bcrypt.compareSync(password, user.password)

    if (!passwordIsValid) { throw AppError.unauthorized("Invalid credentials") }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" })
    return { accessToken }
}
