import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Conversation } from "../models/Conversation.js";
import { HttpError } from "../utils/httpError.js";
import { createAiResponseStream } from "../services/openaiService.js";

function requireUserId(req: Request) {
  if (!req.user?.userId) throw new HttpError(401, "Authentication is required.");
  return req.user.userId;
}

async function findOwnedConversation(conversationId: string, userId: string) {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new HttpError(400, "Invalid conversation id.");
  }

  const conversation = await Conversation.findOne({ _id: conversationId, userId });
  if (!conversation) throw new HttpError(404, "Conversation not found.");
  return conversation;
}

export async function listConversations(req: Request, res: Response) {
  const userId = requireUserId(req);
  const conversations = await Conversation.find({ userId })
    .select("-messages")
    .sort({ updatedAt: -1 });

  res.json({ conversations });
}

export async function getConversation(req: Request, res: Response) {
  const conversation = await findOwnedConversation(req.params.id, requireUserId(req));
  res.json({ conversation });
}

export async function createConversation(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { title, systemPrompt, temperature } = req.body as {
    title?: string;
    systemPrompt?: string;
    temperature?: number;
  };

  const conversation = await Conversation.create({
    userId,
    title: title?.trim() || "New chat",
    systemPrompt,
    temperature
  });

  res.status(201).json({ conversation });
}

export async function updateConversation(req: Request, res: Response) {
  const conversation = await findOwnedConversation(req.params.id, requireUserId(req));
  const { title, systemPrompt, temperature } = req.body as {
    title?: string;
    systemPrompt?: string;
    temperature?: number;
  };

  if (title !== undefined) conversation.title = title.trim() || "New chat";
  if (systemPrompt !== undefined) conversation.systemPrompt = systemPrompt.trim();
  if (temperature !== undefined) conversation.temperature = temperature;

  await conversation.save();
  res.json({ conversation });
}

export async function deleteConversation(req: Request, res: Response) {
  const conversation = await findOwnedConversation(req.params.id, requireUserId(req));
  await conversation.deleteOne();
  res.status(204).send();
}

export async function sendMessage(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { content } = req.body as { content: string };
  const conversation = await findOwnedConversation(req.params.id, userId);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  let assistantContent = "";

  try {
    conversation.messages.push({ role: "user", content });
    if (conversation.title === "New chat") {
      conversation.title = content.slice(0, 60);
    }
    await conversation.save();

    const stream = createAiResponseStream(conversation);

    for await (const token of stream) {
      assistantContent += token;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    conversation.messages.push({
      role: "assistant",
      content: assistantContent || "I could not generate a response."
    });
    await conversation.save();

    res.write(`data: ${JSON.stringify({ done: true, conversation })}\n\n`);
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI response failed.";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
}
