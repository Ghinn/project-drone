"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.AppError = void 0;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
class AppError extends Error {
    statusCode;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
function notFoundHandler(req, _res, next) {
    next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
function errorHandler(err, _req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: "Validation failed.",
            errors: err.flatten(),
        });
    }
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            ...(err.details !== undefined ? { details: err.details } : {}),
        });
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const prismaErr = err;
        if (prismaErr.code === "P2002") {
            return res.status(409).json({
                message: "A unique field conflict occurred.",
                meta: prismaErr.meta,
            });
        }
        if (prismaErr.code === "P2025") {
            return res.status(404).json({
                message: "Record not found.",
            });
        }
        return res.status(400).json({
            message: "Database request failed.",
            code: prismaErr.code,
            meta: prismaErr.meta,
        });
    }
    console.error(err);
    return res.status(500).json({
        message: "Internal server error.",
    });
}
