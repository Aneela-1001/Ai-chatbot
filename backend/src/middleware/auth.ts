import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentication token is required."));
  }

  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired authentication token."));
  }
}
