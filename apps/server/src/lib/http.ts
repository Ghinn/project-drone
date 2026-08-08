import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
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

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "A unique field conflict occurred.",
        meta: err.meta,
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Record not found.",
      });
    }

    return res.status(400).json({
      message: "Database request failed.",
      code: err.code,
      meta: err.meta,
    });
  }

  console.error(err);

  return res.status(500).json({
    message: "Internal server error.",
  });
}