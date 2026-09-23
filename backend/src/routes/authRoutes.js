import express from "express"
import * as authService from "../services/authService.js"
import validate from "../middleware/validationMiddleware.js"
import { registerSchema, loginSchema } from "./authValidation.js"
import { LoginLimit, LogoutAllLimit, LogoutLimit, RefreshLimit, RegisterLimit } from "../middleware/rateLimitMiddleware.js"

const router = express.Router()

router.post("/register", validate(registerSchema), RegisterLimit, async (req, res) => {
    await authService.register(req.body)
    return res.status(201).json({ message: "User registered successfully" })
})

router.post("/login", validate(loginSchema), LoginLimit, async (req, res) => {
    const { id, accessToken, refreshToken } = await authService.login(req.body)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth',
    });

    return res.json({
        id,
        accessToken
    })
})

router.post("/refresh", RefreshLimit, async (req, res) => {
    const { id, accessToken, refreshToken } = await authService.refreshToken(req.cookies.refreshToken)

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/auth'
    })

    return res.json({
        id,
        accessToken
    })
})

router.post("/logout", LogoutLimit, async (req, res) => {
    await authService.revokeRefreshToken(req.cookies.refreshToken)

    res.clearCookie('refreshToken', { path: '/auth/refresh' });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth'
    })

    return res.json({ message: 'Token revoked' });
})

router.post("/logout/all", LogoutAllLimit, async (req, res) => {
    await authService.logoutAllDevices(req.cookies.refreshToken)

    res.clearCookie('refreshToken', { path: '/auth/refresh' });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth'
    })

    return res.json({ message: 'Logged out from all devices' });
})

export default router
