import express from "express"
import * as authService from "../services/authService.js"
import validate from "../middleware/validationMiddleware.js"
import { registerSchema, loginSchema } from "./authValidation.js"
import { LoginLimit, LogoutAllLimit, LogoutLimit, RefreshLimit, RegisterLimit } from "../middleware/rateLimitMiddleware.js"
import requireFrontendOrigin from "../middleware/allowedOriginMiddleware.js"

const router = express.Router()

const isProduction = process.env.NODE_ENV === 'production';

const refreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'none',
    path: '/auth',
};

router.post("/register", validate(registerSchema), requireFrontendOrigin, RegisterLimit, async (req, res) => {
    await authService.register(req.body)
    return res.status(201).json({ message: "User registered successfully" })
})

router.post("/login", validate(loginSchema), LoginLimit, async (req, res) => {
    const { id, accessToken, refreshToken } = await authService.login(req.body)

    res.cookie('refreshToken', refreshToken, {
      ...refreshCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
        id,
        accessToken
    })
})

router.post("/refresh", requireFrontendOrigin, RefreshLimit, async (req, res) => {
    const { id, accessToken, refreshToken } = await authService.refreshToken(req.cookies.refreshToken)

    res.cookie('refreshToken', refreshToken, {
        ...refreshCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.json({
        id,
        accessToken
    })
})

router.post("/logout", requireFrontendOrigin, LogoutLimit, async (req, res) => {
    await authService.revokeRefreshToken(req.cookies.refreshToken)

    res.clearCookie('refreshToken', { path: '/auth/refresh' });

    res.clearCookie('refreshToken', refreshCookieOptions);

    return res.json({ message: 'Token revoked' });
})

router.post("/logout/all", requireFrontendOrigin, LogoutAllLimit, async (req, res) => {
    await authService.logoutAllDevices(req.cookies.refreshToken)

    res.clearCookie('refreshToken', { path: '/auth/refresh' });

    res.clearCookie('refreshToken', refreshCookieOptions);

    return res.json({ message: 'Logged out from all devices' });
})

export default router
