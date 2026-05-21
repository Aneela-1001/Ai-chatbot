import { useEffect } from "react";
import { AuthForm } from "./components/AuthForm";
import { ChatWindow } from "./components/ChatWindow";
import { Sidebar } from "./components/Sidebar";
import { useAuthStore } from "./store/authStore";

export function App() {
  const { user, token, hydrateUser } = useAuthStore();

  useEffect(() => {
    void hydrateUser();
  }, [hydrateUser]);

  if (!user || !token) {
    return <AuthForm />;
  }

  return (
    <main className="flex min-h-screen bg-ink/40 text-slate-100">
      <Sidebar />
      <ChatWindow />
    </main>
  );
}
