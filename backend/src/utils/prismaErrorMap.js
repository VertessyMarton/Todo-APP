import { Prisma } from "../generated/prisma/client.ts";
import AppError from "./AppError.js";

export function mapPrismaError(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return new AppError("Resource already exists", 409, {
          code: "UNIQUE_CONSTRAINT",
          details: err.meta,
        });
      case "P2025":
        return new AppError("Resource not found", 404, {
          code: "NOT_FOUND",
          details: err.meta,
        });
      default:
        return new AppError("Database request failed", 400, {
          code: err.code,
          details: err.meta,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new AppError("Invalid database query", 400, {
      code: "PRISMA_VALIDATION_ERROR",
    });
  }

  return err;
}