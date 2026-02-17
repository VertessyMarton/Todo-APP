import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../db.js"

const router = express.Router()

router.post("/register", (req, res) => {
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
        const insertUser = db.prepare(`INSERT INTO users (username, password)
        VALUES(?, ?)`)
        const result = insertUser.run(username, hashedPassword)
        res.sendStatus(201)
    }catch(err){

        if(err.message.includes("UNIQUE")) {
            return res.sendStatus(409)
        }
       
        console.log(err.message)
        res.sendStatus(503)
       
    }
})

router.post("/login", (req, res) => {

})


export default router