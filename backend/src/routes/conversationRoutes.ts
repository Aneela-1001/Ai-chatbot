import { Router } from "express";
import { body } from "express-validator";
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  sendMessage,
  updateConversation
} from "../controllers/conversationController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const conversationRouter = Router();

conversationRouter.use(requireAuth);

conversationRouter
  .route("/")
  .get(asyncHandler(listConversations))
  .post(
    [
      body("title").optional().trim().isLength({ max: 80 }).withMessage("Title cannot exceed 80 characters."),
      body("systemPrompt").optional().trim().isLength({ max: 2000 }).withMessage("System prompt is too long."),
      body("temperature").optional().isFloat({ min: 0, max: 2 }).withMessage("Temperature must be 0-2.")
    ],
    validate,
    asyncHandler(createConversation)
  );

conversationRouter
  .route("/:id")
  .get(asyncHandler(getConversation))
  .patch(
    [
      body("title").optional().trim().isLength({ max: 80 }).withMessage("Title cannot exceed 80 characters."),
      body("systemPrompt").optional().trim().isLength({ max: 2000 }).withMessage("System prompt is too long."),
      body("temperature").optional().isFloat({ min: 0, max: 2 }).withMessage("Temperature must be 0-2.")
    ],
    validate,
    asyncHandler(updateConversation)
  )
  .delete(asyncHandler(deleteConversation));

conversationRouter.post(
  "/:id/messages",
  [body("content").trim().isLength({ min: 1, max: 12000 }).withMessage("Message must be 1-12000 characters.")],
  validate,
  asyncHandler(sendMessage)
);
