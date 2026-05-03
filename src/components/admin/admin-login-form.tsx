"use client";

import { useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "No se pudo iniciar sesión.");
      setIsLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <section className="w-full max-w-md rounded-[34px] border border-ink/10 bg-white/90 p-7 shadow-glow sm:p-9">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-aqua/10 text-aqua">
          <LockKeyhole size={20} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink/45">Acceso privado</p>
          <h1 className="font-display text-3xl text-ink">Admin</h1>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email administrador"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-aqua"
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-aqua"
        />

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button type="submit" disabled={isLoading} className="ui-cta w-full bg-ink text-white hover:bg-aqua disabled:opacity-70">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </section>
  );
}
