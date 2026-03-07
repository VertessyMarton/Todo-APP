export default class AppError extends Error {
    constructor(message, statusCode = 500, options = {}) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.code = options.code

        Error.captureStackTrace?.(this, this.constructor);
    }

    static badRequest(message, details) {
        return new AppError(message, 400, {
           code : "BAD_REQUEST",
           details
        })
    }

    static unauthorized(message = "Unathorized") {
    return new AppError(message, 401, {
      code: "UNAUTHORIZED"
    });
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403, {
      code: "FORBIDDEN"
    });
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404, {
      code: "NOT_FOUND"
    });
  }

  static conflict(message) {
    return new AppError(message, 409, {
      code: "CONFLICT"
    });
  }
}