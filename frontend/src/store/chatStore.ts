import { create } from "zustand";
import { api, API_URL } from "../lib/api";
import { useAuthStore } from "./authStore";
import type { Conversation, ConversationSummary, Message } from "../types";

interface ChatState {
  conversations: ConversationSummary[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  isStreaming: boolean;
  fetchConversations(): Promise<void>;
  createConversation(): Promise<Conversation>;
  selectConversation(id: string): Promise<void>;
  updateConversation(id: string, payload: Partial<Pick<Conversation, "title" | "systemPrompt" | "temperature">>): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  sendMessage(content: string): Promise<void>;
  reset(): void;
}

function optimisticMessage(role: Message["role"], content: string): Message {
  return {
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  isLoading: false,
  isStreaming: false,
  async fetchConversations() {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/conversations");
      set({ conversations: data.conversations });
    } finally {
      set({ isLoading: false });
    }
  },
  async createConversation() {
    const { data } = await api.post("/conversations", {});
    set((state) => ({
      activeConversation: data.conversation,
      conversations: [data.conversation, ...state.conversations]
    }));
    return data.conversation;
  },
  async selectConversation(id) {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/conversations/${id}`);
      set({ activeConversation: data.conversation });
    } finally {
      set({ isLoading: false });
    }
  },
  async updateConversation(id, payload) {
    const { data } = await api.patch(`/conversations/${id}`, payload);
    set((state) => ({
      activeConversation:
        state.activeConversation?._id === id ? data.conversation : state.activeConversation,
      conversations: state.conversations.map((conversation) =>
        conversation._id === id ? data.conversation : conversation
      )
    }));
  },
  async deleteConversation(id) {
    await api.delete(`/conversations/${id}`);
    set((state) => ({
      conversations: state.conversations.filter((conversation) => conversation._id !== id),
      activeConversation: state.activeConversation?._id === id ? null : state.activeConversation
    }));
  },
  async sendMessage(content) {
    let conversation = get().activeConversation;
    if (!conversation) {
      conversation = await get().createConversation();
    }

    const token = useAuthStore.getState().token;
    if (!token) throw new Error("You must be logged in.");

    const assistantMessage = optimisticMessage("assistant", "");
    set((state) => ({
      isStreaming: true,
      activeConversation: state.activeConversation
        ? {
            ...state.activeConversation,
            messages: [
              ...state.activeConversation.messages,
              optimisticMessage("user", content),
              assistantMessage
            ]
          }
        : state.activeConversation
    }));

    const response = await fetch(`${API_URL}/conversations/${conversation._id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok || !response.body) {
      set({ isStreaming: false });
      throw new Error("Failed to stream AI response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          const payload = JSON.parse(event.slice(6));

          if (payload.error) throw new Error(payload.error);

          if (payload.token) {
            set((state) => {
              if (!state.activeConversation) return state;
              const messages = [...state.activeConversation.messages];
              const last = messages[messages.length - 1];
              messages[messages.length - 1] = { ...last, content: `${last.content}${payload.token}` };
              return { activeConversation: { ...state.activeConversation, messages } };
            });
          }

          if (payload.done) {
            set((state) => ({
              activeConversation: payload.conversation,
              conversations: [
                payload.conversation,
                ...state.conversations.filter((item) => item._id !== payload.conversation._id)
              ]
            }));
          }
        }
      }
    } finally {
      set({ isStreaming: false });
    }
  },
  reset() {
    set({ conversations: [], activeConversation: null, isLoading: false, isStreaming: false });
  }
}));
