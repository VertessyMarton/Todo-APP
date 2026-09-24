import AppError from '../utils/AppError.js';

export default function requireFrontendOrigin(req, res, next) {
    const allowedOrigin =
        process.env.FRONTEND_URL || 'http://localhost:4200';

    if (req.get('Origin') !== allowedOrigin) {
        return next(AppError.forbidden('Origin not allowed'));
    }

    next();
}