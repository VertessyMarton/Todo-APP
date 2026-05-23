import { rateLimit } from 'express-rate-limit'

export function limiter(limit, ttl = 60000) {
    return rateLimit({
        windowMs: ttl,
        limit: limit,
        message: { 'message': 'Too many requests, please try again later!' }  
    })
}

export const LoginLimit = limiter(5, 60000);
export const RegisterLimit = limiter(3, 60 * 60000);
export const MutationLimit = limiter(30, 60000);
export const ReadLimit = limiter(100, 60000);   
