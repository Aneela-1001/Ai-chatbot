import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { HttpError } from "../utils/httpError.js";

export function validate(req: Request, _res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((error) => error.msg)
    .join(" ");

  next(new HttpError(400, message));
}
