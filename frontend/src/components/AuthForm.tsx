import { Bot, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { getErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register, isLoading } = useAuthStore();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-line bg-panel/95 p-6 shadow-soft">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-400 text-ink">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">AI Chatbot</h1>
            <p className="text-sm text-slate-400">Secure conversations with live AI responses.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-md border border-line bg-ink p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded px-3 py-2 text-sm ${mode === "login" ? "bg-sky-400 text-ink" : "text-slate-300"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded px-3 py-2 text-sm ${mode === "register" ? "bg-sky-400 text-ink" : "text-slate-300"}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-md border border-line bg-ink px-3 py-3 text-white outline-none focus:border-sky-400"
                minLength={2}
                maxLength={40}
                required
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-line bg-ink px-3 py-3 text-white outline-none focus:border-sky-400"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-line bg-ink px-3 py-3 text-white outline-none focus:border-sky-400"
              minLength={8}
              required
            />
          </label>

          {error && <p className="rounded-md border border-rose/50 bg-rose/10 px-3 py-2 text-sm text-rose-100">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-400 px-4 py-3 font-semibold text-ink transition hover:bg-sky-300 disabled:opacity-60"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
