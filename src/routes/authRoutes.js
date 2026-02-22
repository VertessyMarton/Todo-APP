import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../prismaClient.js"


const router = express.Router()

router.post("/register", async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" })
    }
    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "username and password must be strings" })
    }

    const cleanUsername = username.trim()

    if (cleanUsername.length < 3) {
        return res.status(400).json({ error: "username must be at least 3 characters" })
    }
    if (password.length < 8) {
        return res.status(400).json({ error: "password must be at least 8 characters" })
    }

    const hashedPassword = bcrypt.hashSync(password, 8) 

    try{
        const user = await prisma.user.create({
            data: {
                username: cleanUsername,
                password: hashedPassword
            }
        })
        return res.sendStatus(201)
    }catch(err){
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Username already exists" });
}
        console.log(err.message)
        res.sendStatus(500)
       
    }
})

router.post("/login", async (req, res) => {
    const {username, password} = req.body

    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" })
    }
    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "username and password must be strings" })
    }

    try{
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (!user) { return res.status(404).json({message: "Invalid credentials"}) }

        const passwordIsValid = bcrypt.compareSync(password, user.password)

        if (!passwordIsValid) { return res.status(401).json({message: "Invalid credentials"}) }

        if (passwordIsValid) { 
            const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: "1h"})
            return res.json({ token })
        }

    }catch(err){
        console.log(err.message)
        res.sendStatus(500)
    }
    
    
})


export default router