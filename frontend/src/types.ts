export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export type MessageRole = "system" | "user" | "assistant";

export interface Message {
  _id?: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  systemPrompt: string;
  temperature: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  _id: string;
  userId: string;
  title: string;
  systemPrompt: string;
  temperature: number;
  createdAt: string;
  updatedAt: string;
}
