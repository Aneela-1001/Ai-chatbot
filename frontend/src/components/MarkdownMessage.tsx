import { Check, Copy } from "lucide-react";
import { useState, type HTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

function CodeBlock({ children, className }: HTMLAttributes<HTMLElement>) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") ?? "text";
  const code = String(children ?? "").replace(/\n$/, "");

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="my-4 overflow-hidden rounded-md border border-line bg-ink">
      <div className="flex items-center justify-between border-b border-line bg-white/5 px-3 py-2 text-xs text-slate-300">
        <span>{language}</span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-200 hover:bg-white/10"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      className="prose prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-code:before:content-none prose-code:after:content-none"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ inline, className, children, ...props }: any) {
          if (inline) {
            return (
              <code className="rounded bg-white/10 px-1 py-0.5 text-sky-200" {...props}>
                {children}
              </code>
            );
          }

          return <CodeBlock className={className}>{children}</CodeBlock>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
