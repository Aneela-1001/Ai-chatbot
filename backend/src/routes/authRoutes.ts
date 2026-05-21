import { Router } from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  [
    body("username").trim().isLength({ min: 2, max: 40 }).withMessage("Username must be 2-40 characters."),
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
  ],
  validate,
  asyncHandler(register)
);

authRouter.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  validate,
  asyncHandler(login)
);

authRouter.get("/me", requireAuth, asyncHandler(me));
