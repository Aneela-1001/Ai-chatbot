import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { Loader2, SendHorizontal } from "lucide-react";
import { useChatStore } from "../store/chatStore";

export function ChatComposer() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { sendMessage, isStreaming } = useChatStore();

  async function submitMessage(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isStreaming) return;

    setMessage("");
    setError("");
    textareaRef.current?.focus();

    try {
      await sendMessage(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
      setMessage(trimmed);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  }

  return (
    <div className="border-t border-line bg-panel/92 px-4 py-4 backdrop-blur">
      <form onSubmit={submitMessage} className="mx-auto max-w-4xl">
        {error && <p className="mb-2 rounded-md border border-rose/50 bg-rose/10 px-3 py-2 text-sm text-rose-100">{error}</p>}
        <div className="flex items-end gap-3 rounded-lg border border-line bg-ink p-3 shadow-soft focus-within:border-sky-400">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the assistant"
            rows={1}
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-1 py-2 text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!message.trim() || isStreaming}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-400 text-ink transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
            title="Send message"
          >
            {isStreaming ? <Loader2 size={19} className="animate-spin" /> : <SendHorizontal size={19} />}
          </button>
        </div>
      </form>
    </div>
  );
}
