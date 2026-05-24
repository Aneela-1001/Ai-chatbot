import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { env } from "../config/env.js";
import type { ConversationDocument } from "../models/Conversation.js";

const openai = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

const MAX_CONTEXT_MESSAGES = 24;
const APPROX_TOKEN_LIMIT = 12000;

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

function trimMessagesToTokenLimit(messages: ChatCompletionMessageParam[]) {
  const trimmed = [...messages];
  let tokens = trimmed.reduce((sum, message) => {
    const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content ?? "");
    return sum + estimateTokens(content);
  }, 0);

  while (tokens > APPROX_TOKEN_LIMIT && trimmed.length > 2) {
    const removed = trimmed.splice(1, 1)[0];
    const content = typeof removed.content === "string" ? removed.content : JSON.stringify(removed.content ?? "");
    tokens -= estimateTokens(content);
  }

  return trimmed;
}

export function buildOpenAiMessages(conversation: ConversationDocument): ChatCompletionMessageParam[] {
  const recentMessages = conversation.messages.slice(-MAX_CONTEXT_MESSAGES);

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: conversation.systemPrompt || "You are a helpful AI assistant."
    },
    ...recentMessages.map((message) => ({
      role: message.role as "system" | "user" | "assistant",
      content: message.content
    }))
  ];

  return trimMessagesToTokenLimit(messages);
}

async function* streamOpenAiResponse(conversation: ConversationDocument) {
  if (!openai) throw new Error("OpenAI API key is missing.");

  const stream = await openai.chat.completions.create({
    model: env.openAiModel,
    messages: buildOpenAiMessages(conversation),
    temperature: conversation.temperature,
    stream: true
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? "";
    if (token) yield token;
  }
}

function buildGeminiRequest(conversation: ConversationDocument) {
  const recentMessages = conversation.messages.slice(-MAX_CONTEXT_MESSAGES);

  return {
    systemInstruction: {
      parts: [{ text: conversation.systemPrompt || "You are a helpful AI assistant." }]
    },
    contents: recentMessages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    })),
    generationConfig: {
      temperature: conversation.temperature
    }
  };
}

async function* streamGeminiResponse(conversation: ConversationDocument) {
  if (!env.geminiApiKey) throw new Error("Gemini API key is missing.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:streamGenerateContent?alt=sse`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.geminiApiKey
    },
    body: JSON.stringify(buildGeminiRequest(conversation))
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(formatGeminiError(errorText || response.statusText));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let yieldedText = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const dataLine = event
        .split("\n")
        .find((line) => line.startsWith("data: "));

      if (!dataLine) continue;

      const payload = JSON.parse(dataLine.slice(6));
      const candidate = payload.candidates?.[0];
      const token = candidate?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? "")
        .join("") ?? "";

      if (token) {
        yieldedText = true;
        yield token;
      }
    }
  }

  if (!yieldedText) {
    const fallbackText = await createGeminiFallbackResponse(conversation);
    if (!fallbackText) {
      throw new Error("Gemini returned an empty response. Try a different model such as gemini-2.0-flash.");
    }
    yield fallbackText;
  }
}

function formatGeminiError(errorText: string) {
  try {
    const payload = JSON.parse(errorText);
    const message = payload.error?.message as string | undefined;

    if (payload.error?.code === 429 || message?.toLowerCase().includes("quota")) {
      return "Gemini quota limit reached. Wait a while, choose another available Gemini model, or enable billing/API quota in Google AI Studio.";
    }

    return message ? `Gemini request failed: ${message}` : "Gemini request failed.";
  } catch {
    return `Gemini request failed: ${errorText}`;
  }
}

async function createGeminiFallbackResponse(conversation: ConversationDocument) {
  if (!env.geminiApiKey) throw new Error("Gemini API key is missing.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.geminiApiKey
    },
    body: JSON.stringify(buildGeminiRequest(conversation))
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(formatGeminiError(errorText || response.statusText));
  }

  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim() ?? "";
}

export function createAiResponseStream(conversation: ConversationDocument) {
  if (env.aiProvider === "openai") {
    return streamOpenAiResponse(conversation);
  }

  return streamGeminiResponse(conversation);
}
