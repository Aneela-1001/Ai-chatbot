import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useChatStore } from "../store/chatStore";

export function SettingsPanel() {
  const { activeConversation, updateConversation } = useChatStore();
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);

  useEffect(() => {
    setSystemPrompt(activeConversation?.systemPrompt ?? "You are a helpful, concise AI assistant.");
    setTemperature(activeConversation?.temperature ?? 0.7);
  }, [activeConversation?._id, activeConversation?.systemPrompt, activeConversation?.temperature]);

  async function saveSettings() {
    if (!activeConversation) return;
    await updateConversation(activeConversation._id, { systemPrompt, temperature });
  }

  return (
    <details className="border-b border-line bg-panel/70 px-4 py-3">
      <summary className="mx-auto flex max-w-4xl cursor-pointer list-none items-center gap-2 text-sm font-medium text-slate-200">
        <SlidersHorizontal size={16} />
        Chat settings
      </summary>
      <div className="mx-auto mt-4 grid max-w-4xl gap-4 md:grid-cols-[1fr_220px]">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">System prompt</span>
          <textarea
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
          />
        </label>
        <div>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
              Temperature: {temperature.toFixed(1)}
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={(event) => setTemperature(Number(event.target.value))}
              className="w-full accent-sky-400"
            />
          </label>
          <button
            type="button"
            onClick={saveSettings}
            disabled={!activeConversation}
            className="mt-4 w-full rounded-md border border-line px-3 py-2 text-sm text-slate-100 hover:bg-white/5 disabled:opacity-50"
          >
            Save settings
          </button>
        </div>
      </div>
    </details>
  );
}
