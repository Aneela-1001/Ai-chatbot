import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";
import { env } from "../config/env.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;

  res.status(statusCode).json({
    message: statusCode === 500 ? "Something went wrong." : error.message,
    stack: env.nodeEnv === "development" ? error.stack : undefined
  });
}
