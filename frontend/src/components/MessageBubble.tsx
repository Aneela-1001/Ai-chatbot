import { Bot, User } from "lucide-react";
import clsx from "clsx";
import type { Message } from "../types";
import { MarkdownMessage } from "./MarkdownMessage";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <article className={clsx("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-mint text-ink">
          <Bot size={18} />
        </div>
      )}

      <div
        className={clsx(
          "max-w-[min(760px,calc(100vw-4rem))] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm",
          isUser ? "bg-sky-400 text-ink" : "border border-line bg-panel text-slate-100"
        )}
      >
        {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <MarkdownMessage content={message.content || " "} />}
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-slate-200">
          <User size={17} />
        </div>
      )}
    </article>
  );
}
