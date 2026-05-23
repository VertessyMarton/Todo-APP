import AppError from "../utils/AppError.js"
import { mapPrismaError } from "../utils/prismaErrorMap.js";
import { ZodError } from "zod";

export default function errorHandler(err, req, res, next) {
    if(res.headersSent) {
        return next(err)
    }

    if (err?.type === "entity.parse.failed") {
    err = AppError.badRequest("Malformed JSON body");
    }

    const nodeEnv = (process.env.NODE_ENV || "").trim().replace(/^["']|["']$/g, "");
    const isProd = nodeEnv === "production";

    err = mapPrismaError(err);

    let statusCode = 500;
    let message = "Internal Server Error";
    let code = "INTERNAL_ERROR";
    let details;

    if(err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
        code = err.code || code
        details = err.details
    }

    if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    code = "VALIDATION_ERROR";

    details = err.issues.map(e => ({
      path: e.path.join("."),
      message: e.message
    }));
  }

    console.error({
        name: err.name,
        message: err.message,
        method: req.method,
        path: req.originalUrl,
        ...(isProd ? {} : { stack: err.stack }),
    })

    res.status(statusCode).json({
    error: {
      message,
      code,
      ...(details && { details }),
      ...(isProd ? {} : { stack: err.stack }),
    },
  });
}
