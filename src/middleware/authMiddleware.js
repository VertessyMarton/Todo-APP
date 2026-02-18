import jwt from "jsonwebtoken"

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" })
    }
    
    const token = authHeader.split(" ")[1]

    if (!token) { return res.status(401).json({error: "No token provided"}) }

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        if(err) { return res.status(401).json({error: "Invalid token" })}

        req.userId = decode.id
        next()
    })
}

export default authMiddleware
