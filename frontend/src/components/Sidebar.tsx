import { LogOut, Menu, MessageSquarePlus, Pencil, Trash2, X } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { IconButton } from "./ui/IconButton";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const {
    activeConversation,
    conversations,
    createConversation,
    selectConversation,
    updateConversation,
    deleteConversation,
    reset
  } = useChatStore();

  function handleLogout() {
    reset();
    logout();
  }

  async function renameConversation(id: string, currentTitle: string) {
    const nextTitle = window.prompt("Rename chat", currentTitle);
    if (nextTitle === null) return;
    await updateConversation(id, { title: nextTitle });
  }

  return (
    <>
      <IconButton label="Open sidebar" className="fixed left-4 top-4 z-30 lg:hidden" onClick={() => setIsOpen(true)}>
        <Menu size={18} />
      </IconButton>

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-80 max-w-[86vw] flex-col border-r border-line bg-ink transition lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="truncate font-medium text-white">{user?.username}</p>
          </div>
          <IconButton label="Close sidebar" className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </IconButton>
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={() => createConversation()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-400 px-4 py-3 font-semibold text-ink transition hover:bg-sky-300"
          >
            <MessageSquarePlus size={18} />
            New chat
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          {conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={clsx(
                "group flex items-center gap-2 rounded-md px-2 py-2",
                activeConversation?._id === conversation._id ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <button
                type="button"
                onClick={() => {
                  selectConversation(conversation._id);
                  setIsOpen(false);
                }}
                className="min-w-0 flex-1 truncate text-left text-sm text-slate-100"
              >
                {conversation.title}
              </button>
              <button
                type="button"
                title="Rename"
                onClick={() => renameConversation(conversation._id, conversation.title)}
                className="rounded p-1 text-slate-400 opacity-0 hover:bg-white/10 hover:text-white group-hover:opacity-100"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                title="Delete"
                onClick={() => deleteConversation(conversation._id)}
                className="rounded p-1 text-slate-400 opacity-0 hover:bg-white/10 hover:text-rose-200 group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-line px-4 py-3 text-sm text-slate-200 hover:bg-white/5"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {isOpen && <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}
