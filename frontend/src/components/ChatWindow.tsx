import { Bot, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useChatStore } from "../store/chatStore";
import { ChatComposer } from "./ChatComposer";
import { MessageBubble } from "./MessageBubble";
import { SettingsPanel } from "./SettingsPanel";

export function ChatWindow() {
  const { activeConversation, conversations, isLoading, isStreaming, fetchConversations, createConversation } = useChatStore();
  const endRef = useAutoScroll(activeConversation?.messages.length ?? 0);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  const hasMessages = Boolean(activeConversation?.messages.length);

  return (
    <section className="flex min-h-screen flex-1 flex-col">
      <header className="border-b border-line bg-panel/90 px-16 py-4 backdrop-blur lg:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-white">{activeConversation?.title ?? "AI Chatbot"}</h1>
            <p className="text-sm text-slate-400">
              {isStreaming ? "Assistant is typing..." : "Streaming AI chat with saved history"}
            </p>
          </div>
          {isStreaming && <Loader2 size={19} className="shrink-0 animate-spin text-sky-300" />}
        </div>
      </header>

      <SettingsPanel />

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 size={20} className="mr-2 animate-spin" />
              Loading conversations
            </div>
          )}

          {!isLoading && !hasMessages && (
            <div className="flex min-h-[48vh] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-sky-400 text-ink">
                <Bot size={32} />
              </div>
              <h2 className="text-2xl font-semibold text-white">Start a conversation</h2>
              <p className="mt-2 max-w-md text-slate-400">
                Ask a question, paste code, draft content, or continue from a saved chat.
              </p>
              {!conversations.length && (
                <button
                  type="button"
                  onClick={() => createConversation()}
                  className="mt-6 rounded-md border border-line px-4 py-2 text-sm text-slate-100 hover:bg-white/5"
                >
                  Create first chat
                </button>
              )}
            </div>
          )}

          {activeConversation?.messages.map((message, index) => (
            <MessageBubble key={message._id ?? `${message.role}-${index}`} message={message} />
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <ChatComposer />
    </section>
  );
}
