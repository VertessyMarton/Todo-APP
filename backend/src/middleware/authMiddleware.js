import jwt from "jsonwebtoken"
import AppError from "../utils/AppError.js"

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(AppError.unauthorized("No token provided"))
    }
    
    const token = authHeader.split(" ")[1]

    if (!token) { return next(AppError.unauthorized("No token provided")) }

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        if(err) { return next(AppError.unauthorized("Invalid token")) }

        req.userId = decode.id
        next()
    })
}

export default authMiddleware
