import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { signToken } from "../utils/jwt.js";

function sanitizeUser(user: { _id: unknown; username: string; email: string; createdAt?: Date }) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  };
}

export async function register(req: Request, res: Response) {
  const { username, email, password } = req.body as {
    username: string;
    email: string;
    password: string;
  };

  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, "An account with this email already exists.");

  const user = await User.create({ username, email, password });
  const token = signToken({ userId: String(user._id), email: user.email });

  res.status(201).json({ token, user: sanitizeUser(user) });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const token = signToken({ userId: String(user._id), email: user.email });
  res.json({ token, user: sanitizeUser(user) });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user?.userId);
  if (!user) throw new HttpError(404, "User not found.");

  res.json({ user: sanitizeUser(user) });
}
