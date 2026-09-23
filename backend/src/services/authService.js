import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../prismaClient.js"
import AppError from "../utils/AppError.js"
import { randomUUID, randomBytes, createHash } from 'node:crypto'
import { tr } from "zod/v4/locales"

const Status = Object.freeze({
    ROTATED: "rotated",
    LOGOUT: "logout",
    LOGOUT_ALL: "logout_all",
    REUSE_DETECTED: "reuse_detected"
})

export async function register({ username, password }) {
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            lists: {
                create: { name: "My todos" }
            }
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

    const sessionId = randomUUID();

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "10m" })
    const refreshToken = await this.createRefreshToken(user.id, sessionId)

    return { 
        id: user.id,
        accessToken,
        refreshToken
    }
}

export async function createRefreshToken(userId, sessionId) {
    const refreshToken = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenHash = createHash("sha256")
            .update(refreshToken)
            .digest('hex')
    
    await prisma.refreshToken.create({
        data: {
            refreshToken: tokenHash,
            sessionId,
            expiresAt,
            userId
        }
    })

    return refreshToken 
}

export async function isTokenValid(refreshToken) {
    if (typeof refreshToken !== 'string' || !refreshToken) {
        throw AppError.unauthorized('Invalid token');
    }

    const tokenHash = createHash("sha256")
            .update(refreshToken)
            .digest('hex')

    const isToken = await prisma.refreshToken.findUnique({
        where: {
            refreshToken: tokenHash
        }
    })

    if (!isToken) {
    throw AppError.unauthorized('Invalid token');
}

     if(isToken.revoked){
        if (isToken.revokedReason === Status.ROTATED) {
            await prisma.refreshToken.updateMany({
                where: {
                    sessionId: isToken.sessionId,
                    revokedAt: null
                },
                data: {
                    revoked: true,
                    revokedAt: new Date(),
                    revokedReason: Status.REUSE_DETECTED
                }
            })
        }
        throw AppError.unauthorized("Invalid Token")
    }

    if(isToken.expiresAt <= new Date() || isToken.revokedAt !== null) {
        throw AppError.unauthorized('Invalid token')
    }

    return isToken  
}

export async function rotateRefreshToken(refreshToken) {
    const validToken = await this.isTokenValid(refreshToken)

    await prisma.refreshToken.update({
        where: {
            id: validToken.id
        },
        data: {
            revoked: true,
            revokedAt: new Date(),
            revokedReason: Status.ROTATED
        }
    })

    const newRefreshToken = await this.createRefreshToken(validToken.userId, validToken.sessionId)

    return {
        refreshToken: newRefreshToken,
        userId: validToken.userId
    }
}

export async function revokeRefreshToken(refreshToken) {
    const validToken = await this.isTokenValid(refreshToken)

    await prisma.refreshToken.updateMany({
        where: {
            sessionId: validToken.sessionId,
            revokedAt: null
        },
        data: {
            revoked: true,
            revokedAt: new Date(),
            revokedReason: Status.LOGOUT
        }
    })
}

export async function logoutAllDevices(refreshToken) {
    const validToken = await this.isTokenValid(refreshToken)

    await prisma.refreshToken.updateMany({
        where: {
            userId: validToken.userId,
            revokedAt: null
        },
        data: {
            revoked: true,
            revokedAt: new Date(),
            revokedReason: Status.LOGOUT_ALL
        }
    })
}

export async function refreshToken(refreshToken) {
    if(!refreshToken) {
        throw AppError.unauthorized('invalid token')
    }

    const rotate = await this.rotateRefreshToken(refreshToken)

    const accessToken = jwt.sign({ id: rotate.userId }, process.env.JWT_SECRET, { expiresIn: "10m" })

    return {
        id: rotate.userId,
        accessToken,
        refreshToken: rotate.refreshToken
    }
}
